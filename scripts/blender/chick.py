# Builds the chick mascot in Blender. Run from Blender's Python (or via MCP):
#   exec(open(r"<repo>/scripts/blender/chick.py").read())
# Produces mesh objects "Body" (materials ChickBody + ChickAccent) and "Eyes" (ChickEyes).
import bpy, bmesh
from math import radians

for o in list(bpy.data.objects):
    if o.type == "MESH":
        bpy.data.objects.remove(o, do_unlink=True)


def material(name, hex_color, roughness, coat=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    bsdf.inputs["Base Color"].default_value = (*lin, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    for key in ("Coat Weight", "Clearcoat"):
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = coat
    return mat


body_mat = material("ChickBody", "#b9a8f0", 0.45, 0.3)
accent_mat = material("ChickAccent", "#8f78d6", 0.4, 0.3)
eye_mat = material("ChickEyes", "#050508", 0.05, 1.0)


def ellipsoid(name, loc, scale, rot=(0, 0, 0), segments=48, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    o.rotation_euler = [radians(a) for a in rot]
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.object.shade_smooth()
    return o


# Body: the reference's wide dome. The lower hemisphere is squashed into a soft, flat-ish base.
body = ellipsoid("Body", (0, 0, 0), (1.25, 1.12, 1.18), segments=64, rings=32)
bm = bmesh.new()
bm.from_mesh(body.data)
for v in bm.verts:
    if v.co.z < 0:
        v.co.z *= 0.42
bm.to_mesh(body.data)
bm.free()
body.data.materials.append(body_mat)
body.data.materials.append(accent_mat)

parts = [body]
# Feather tuft on top, leaning back.
for i, (x, tilt, h) in enumerate([(-0.13, -18, 0.42), (0.0, 0, 0.5), (0.13, 18, 0.4)]):
    parts.append(ellipsoid(f"Tuft{i}", (x, 0.2, 1.12 + h * 0.45), (0.11, 0.08, h * 0.62), rot=(-28, tilt, 0), segments=24, rings=12))
# Wing nubs.
for side in (-1, 1):
    parts.append(ellipsoid(f"Wing{side}", (side * 1.16, 0.12, 0.02), (0.12, 0.38, 0.27), rot=(0, side * -20, side * 12), segments=32, rings=16))

accent = []
# Beak: a short rounded cone between and below the eyes, pointing forward (-Y).
bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.17, radius2=0.03, depth=0.26, location=(0, -1.06, 0.06), rotation=(radians(90), 0, 0))
beak = bpy.context.active_object
beak.name = "Beak"
beak.scale = (1.0, 0.75, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
bpy.ops.object.shade_smooth()
accent.append(beak)
# Feet: stubby rounded cups under the body, like the reference.
for side in (-1, 1):
    f = ellipsoid(f"Foot{side}", (side * 0.32, -0.22, -0.56), (0.22, 0.28, 0.17), segments=32, rings=16)
    bm = bmesh.new()
    bm.from_mesh(f.data)
    for v in bm.verts:
        if v.co.z > 0:
            v.co.z *= 1.6
    bm.to_mesh(f.data)
    bm.free()
    accent.append(f)
for o in accent:
    o.data.materials.append(accent_mat)
for o in parts[1:]:
    o.data.materials.append(body_mat)

bpy.ops.object.select_all(action="DESELECT")
for o in parts + accent:
    o.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
# Re-map slots after join so body parts use ChickBody and accent parts use ChickAccent.
body = bpy.context.active_object
mats = body.data.materials
names = [m.name for m in mats]
for poly in body.data.polygons:
    poly.material_index = 0 if mats[poly.material_index].name == "ChickBody" else 1
while len(body.data.materials) > 2:
    body.data.materials.pop(index=len(body.data.materials) - 1)
body.data.materials[0] = body_mat
body.data.materials[1] = accent_mat

# Eyes: glossy black tall ovals on the front of the dome.
eyes = []
for side in (-1, 1):
    eyes.append(ellipsoid(f"Eye{side}", (side * 0.36, -0.99, 0.3), (0.14, 0.07, 0.21), rot=(-12, 0, side * -14), segments=32, rings=16))
bpy.ops.object.select_all(action="DESELECT")
for o in eyes:
    o.select_set(True)
bpy.context.view_layer.objects.active = eyes[0]
bpy.ops.object.join()
eye_obj = bpy.context.active_object
eye_obj.name = "Eyes"
eye_obj.data.materials.clear()
eye_obj.data.materials.append(eye_mat)

print("built", body.name, len(body.data.polygons), eye_obj.name, len(eye_obj.data.polygons), names)
