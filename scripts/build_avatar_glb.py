"""
build_avatar_glb.py — packs 3D-Srinidhi + his 5 moves into ONE small web file.
(Session 53, 2026-09-28 — task AV-4 of the 3D-avatar plan.)

WHAT IT DOES
  Inputs (kept OUTSIDE the repo, in C:\\Development\\avatar-work\\):
    • model.glb             — his Avaturn avatar (face, hair, specs, clothes, skeleton)
    • 5 Mixamo move files   — made on Avaturn's SAMPLE model (same skeleton), so
                              his face never had to go to Adobe.
  Output: public/models/srinidhi.glb with 5 named clips the website uses:
    Sitting · Standing · Jump · Walking · Idle   (same names as the robot stand-in)

  Steps:
    1. Import the avatar.
    2. For each move: import it, then TRANSFER it onto the avatar "by body angle":
       for every bone we take how much the Mixamo bone turned away from ITS rest
       pose (in world space) and apply that same turn to the avatar's bone.
       Why not just copy the numbers? The two skeletons' bones point a few
       degrees differently at rest (measured: median ~7°), so copying the raw
       numbers would bend elbows/knees wrongly. Copying the TURN is immune to that.
    3. "In place": the website slides him across the page itself, so moves that
       travel (Sit To Stand drifts 0.5 m, Jumping Down travels 1.8 m forward and
       drops 0.8 m off a ledge) are pinned to one spot. For the jump, the ledge
       drop is removed between take-off and landing, leaving only the hop itself.
    4. Slim materials: keep colour textures only (face/body 1024 px, rest 512 px).
    5. Export one GLB and print a report: size, clips, and the numbers the web
       code needs (jump take-off/landing fractions, walk speed, seat height).

HOW TO RUN (from the project root; Blender 5.2 installed):
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b --factory-startup ^
      -P scripts/build_avatar_glb.py

Example report line:  "Jump: take-off at 31% of the clip, landing at 58%"
  → RobotWalker.js uses those two numbers so the page-hop matches the legs.
"""
import logging
import math
import os

import bpy
from mathutils import Matrix, Quaternion, Vector

logging.basicConfig(level=logging.INFO, format="[avatar] %(message)s")
log = logging.getLogger(__name__)

# ── Inputs / outputs ───────────────────────────────────────────────────────
WORK_DIR = r"C:\Development\avatar-work"
AVATAR_GLB = os.path.join(WORK_DIR, "model.glb")
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_GLB = os.path.join(PROJECT_ROOT, "public", "models", "srinidhi.glb")

# Website clip name → (Mixamo file, how to treat it)
#   keep_xy : False = pin horizontal travel (he must not drift off his line)
#   ledge   : True  = remove the drop off the ledge (Jumping Down only)
CLIPS = {
    "Sitting":  ("Male Sitting Pose.fbx", dict(keep_xy=False, ledge=False)),
    "Standing": ("Sit To Stand.fbx",      dict(keep_xy=False, ledge=False)),
    "Jump":     ("Jumping Down.fbx",      dict(keep_xy=False, ledge=True)),
    "Walking":  ("Walking.fbx",           dict(keep_xy=True,  ledge=False)),
    "Idle":     ("Idle.fbx",              dict(keep_xy=True,  ledge=False)),
}
MAX_TEXTURE_PX = 1024
FEET = ("LeftFoot", "RightFoot", "LeftToeBase", "RightToeBase")


def import_armature(import_fn, **kwargs):
    """Run an importer and return the ONE new armature object it created."""
    before = set(bpy.data.objects)
    import_fn(**kwargs)
    new = [o for o in bpy.data.objects if o not in before and o.type == "ARMATURE"]
    if len(new) != 1:
        raise RuntimeError(f"expected 1 armature from {kwargs}, got {len(new)}")
    return new[0]


def bones_parent_first(arm):
    """Avatar bones ordered so every parent comes before its children."""
    order = []
    def walk(b):
        order.append(b)
        for c in b.children:
            walk(c)
    for root in (b for b in arm.data.bones if b.parent is None):
        walk(root)
    return order


def foot_min_z(clip_arm):
    """Height of the LOWEST foot/toe joint right now (world space)."""
    return min((clip_arm.matrix_world @ clip_arm.pose.bones[n].head).z
               for n in FEET if n in clip_arm.pose.bones)


def ledge_ramp(clip_arm, f0, f1):
    """For Jumping Down: per-frame 0→1 'how far through the fall' + report.

    Take-off = first frame the lowest foot leaves the ledge height;
    landing  = first later frame it reaches the floor height. Linear between.
    """
    sc = bpy.context.scene
    zs = []
    for f in range(f0, f1 + 1):
        sc.frame_set(f)
        zs.append(foot_min_z(clip_arm))
    z_ledge, z_floor = zs[0], zs[-1]
    drop = z_ledge - z_floor
    take = next(i for i, z in enumerate(zs) if abs(z - z_ledge) > 0.03)
    land = next(i for i, z in enumerate(zs) if i > take and z <= z_floor + 0.03)
    n = len(zs) - 1
    log.info(f"Jump: ledge drop {drop:.2f} m; take-off at {take / n:.0%} of the clip, "
             f"landing at {land / n:.0%}")
    ramp = [min(1.0, max(0.0, (i - take) / max(1, land - take))) for i in range(len(zs))]
    return ramp, drop, (take / n, land / n)


def transfer_clip(av, clip_arm, clip_name, keep_xy, ledge):
    """Bake one Mixamo move onto the avatar as a new action named clip_name."""
    sc = bpy.context.scene
    act_src = clip_arm.animation_data.action
    f0, f1 = (int(round(x)) for x in act_src.frame_range)
    n_frames = f1 - f0 + 1

    # Rest poses in WORLD space (the two armatures sit differently in the scene).
    av_rest = {b.name: av.matrix_world @ b.matrix_local for b in av.data.bones}
    cl_rest = {b.name: clip_arm.matrix_world @ b.matrix_local for b in clip_arm.data.bones}
    # Scale hips travel by leg length (hips rest height) in case sizes differ.
    hip_scale = av_rest["Hips"].translation.z / max(1e-6, cl_rest["Hips"].translation.z)

    ramp, drop, fractions = (None, 0.0, None)
    if ledge:
        ramp, drop, fractions = ledge_ramp(clip_arm, f0, f1)

    # Fresh action on the avatar for this clip.
    av.animation_data_create()
    action = bpy.data.actions.new(clip_name)
    av.animation_data.action = action
    order = bones_parent_first(av)
    av_inv = av.matrix_world.inverted()
    prev_q = {}

    sc.frame_set(f0)
    hips_start = clip_arm.matrix_world @ clip_arm.pose.bones["Hips"].head

    for i, f in enumerate(range(f0, f1 + 1)):
        sc.frame_set(f)
        full = {}  # avatar bone name → desired ARMATURE-space matrix this frame
        for b in order:
            pb = av.pose.bones[b.name]
            cpb = clip_arm.pose.bones[b.name]
            # How far the Mixamo bone has turned from its rest pose (world space)…
            cl_world = clip_arm.matrix_world @ cpb.matrix
            turn = cl_world.to_quaternion() @ cl_rest[b.name].to_quaternion().inverted()
            # …applied to the avatar bone's own rest orientation.
            want_rot = (av_inv.to_quaternion() @ turn @ av_rest[b.name].to_quaternion())

            if b.parent is None:  # Hips: rotation AND position
                p = clip_arm.matrix_world @ cpb.head
                if not keep_xy:
                    p = Vector((hips_start.x, hips_start.y, p.z))
                if ramp is not None:  # remove the ledge drop, keep the hop
                    p.z -= drop * (1.0 - ramp[i])
                delta = (p - cl_rest["Hips"].translation) * hip_scale
                want_pos = av_inv @ (av_rest["Hips"].translation + delta)
                want = Matrix.Translation(want_pos) @ want_rot.to_matrix().to_4x4()
                basis = b.matrix_local.inverted() @ want
                loc, q, _ = basis.decompose()
                pb.location = loc
                pb.keyframe_insert("location", frame=i, group=b.name)
                full[b.name] = want
            else:  # children: rotation only (their position comes from the parent)
                base = full[b.parent.name] @ (b.parent.matrix_local.inverted() @ b.matrix_local)
                q = base.to_quaternion().inverted() @ want_rot
                full[b.name] = base @ q.to_matrix().to_4x4()

            # Keep quaternion signs continuous (q and -q are the same turn, but
            # mixing them makes the in-between frames spin the long way round).
            if b.name in prev_q and prev_q[b.name].dot(q) < 0:
                q = Quaternion((-q.w, -q.x, -q.y, -q.z))
            prev_q[b.name] = q
            pb.rotation_mode = "QUATERNION"
            pb.rotation_quaternion = q
            pb.keyframe_insert("rotation_quaternion", frame=i, group=b.name)

    # Park the finished action on its own NLA track (glTF exports one animation per track).
    av.animation_data.action = None
    track = av.animation_data.nla_tracks.new()
    track.name = clip_name
    track.strips.new(clip_name, 0, action)
    log.info(f"{clip_name}: {n_frames} frames ({(n_frames - 1) / 30:.2f} s) baked")
    return fractions


def walk_speed(av):
    """Natural ground speed of the Walking clip (m/s): how far a planted foot slides back."""
    track = av.animation_data.nla_tracks["Walking"]
    action = track.strips[0].action
    av.animation_data.action = action
    sc = bpy.context.scene
    f0, f1 = (int(round(x)) for x in action.frame_range)
    ys = []
    for f in range(f0, f1 + 1):
        sc.frame_set(f)
        ys.append((av.matrix_world @ av.pose.bones["LeftFoot"].head).y)
    av.animation_data.action = None
    stroke = max(ys) - min(ys)
    secs = (f1 - f0) / 30
    return stroke / (secs / 2)  # foot is planted ~half the cycle


def seat_height(av):
    """Hips height in the Sitting clip (m above the feet) — the web code sits him from this."""
    action = av.animation_data.nla_tracks["Sitting"].strips[0].action
    av.animation_data.action = action
    bpy.context.scene.frame_set(0)
    hips = (av.matrix_world @ av.pose.bones["Hips"].head).z
    feet = min((av.matrix_world @ av.pose.bones[n].head).z for n in FEET if n in av.pose.bones)
    av.animation_data.action = None
    return hips - feet


def slim_materials():
    """Keep only what's visible at ~80 px: the COLOUR texture (+ hair's alpha).

    Bump (normal) maps and shininess/occlusion maps are invisible at that size
    but were ~half the file. Face/body colour stays sharp; the rest shrinks.
    """
    for m in bpy.data.materials:
        if not m.use_nodes:
            continue
        nodes = m.node_tree.nodes
        bsdf = next((n for n in nodes if n.type == "BSDF_PRINCIPLED"), None)
        if bsdf is None:
            continue
        keep = {l.from_node for s in ("Base Color", "Alpha") for l in bsdf.inputs[s].links}
        for n in list(nodes):
            if n.type in ("TEX_IMAGE", "NORMAL_MAP", "SEPARATE_COLOR") and n not in keep:
                nodes.remove(n)
        bsdf.inputs["Metallic"].default_value = 0.0
        bsdf.inputs["Roughness"].default_value = 0.7
        cap = MAX_TEXTURE_PX if "body" in m.name else MAX_TEXTURE_PX // 2
        for n in keep:
            img = getattr(n, "image", None)
            if img and max(img.size) > cap:
                w, h = img.size
                img.scale(cap * w // max(w, h), cap * h // max(w, h))
                log.info(f"{m.name}: colour texture {w}x{h} → {img.size[0]}x{img.size[1]}")
    # Images no longer used by any material are dropped on export automatically.


def export_glb():
    """Export with only the options this Blender's glTF exporter actually has."""
    wanted = dict(
        filepath=OUT_GLB, export_format="GLB",
        export_animations=True, export_animation_mode="NLA_TRACKS",
        export_force_sampling=True, export_optimize_animation_size=True,
        export_skins=True, export_morph=False, export_cameras=False, export_lights=False,
        export_image_format="AUTO", export_jpeg_quality=80, export_image_quality=80,
        export_yup=True,
    )
    known = bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
    opts = {k: v for k, v in wanted.items() if k in known}
    skipped = sorted(set(wanted) - set(opts))
    if skipped:
        log.info(f"exporter lacks {skipped} — skipped")
    bpy.ops.export_scene.gltf(**opts)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.render.fps = 30
    av = import_armature(bpy.ops.import_scene.gltf, filepath=AVATAR_GLB)
    # The glTF importer may leave an animation-less avatar; clear any stray action.
    if av.animation_data:
        av.animation_data.action = None
    log.info(f"avatar: {len(av.data.bones)} bones")

    fractions = None
    for clip_name, (fname, opt) in CLIPS.items():
        path = os.path.join(WORK_DIR, fname)
        clip_arm = import_armature(bpy.ops.import_scene.fbx, filepath=path)
        got = transfer_clip(av, clip_arm, clip_name, **opt)
        fractions = fractions or got
        bpy.data.objects.remove(clip_arm, do_unlink=True)  # done with this move

    # Drop the actions the FBX importer created (only the avatar's go out).
    for a in list(bpy.data.actions):
        if a.name not in CLIPS:
            bpy.data.actions.remove(a)

    speed = walk_speed(av)
    seat = seat_height(av)
    slim_materials()
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    export_glb()

    size_mb = os.path.getsize(OUT_GLB) / 1e6
    log.info("──── REPORT ────")
    log.info(f"wrote {OUT_GLB} ({size_mb:.2f} MB)")
    log.info(f"walk ground speed: {speed:.2f} m/s at time-scale 1")
    log.info(f"seat: hips {seat:.2f} m above the feet when sitting")
    if fractions:
        log.info(f"jump airborne window: {fractions[0]:.2f} → {fractions[1]:.2f} of the clip")


main()
