# Builds chunky extruded letters (DM Sans Bold) for the hero name and exports letters.glb.
# Usage inside Blender:  FONT = r"<path to DMSans-Bold.ttf>"; OUT = r"<repo>/public/mascot/letters.glb"
#                        exec(open(r"<repo>/scripts/blender/letters.py").read())
import bpy

CHARS = "JUSTINMAZO"
CAP = 1.0  # cap height after normalisation

for o in list(bpy.data.objects):
    if o.name.startswith("L_"):
        bpy.data.objects.remove(o, do_unlink=True)

mat = bpy.data.materials.get("Letter") or bpy.data.materials.new("Letter")
mat.use_nodes = True
bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
bsdf.inputs["Base Color"].default_value = (0.86, 0.86, 0.88, 1)
bsdf.inputs["Roughness"].default_value = 0.35

font = bpy.data.fonts.load(FONT, check_existing=True)
made = []
for ch in CHARS:
    curve = bpy.data.curves.new(f"L_{ch}", "FONT")
    curve.body = ch
    curve.font = font
    curve.size = 1.0
    curve.extrude = 0.09
    curve.bevel_depth = 0.022
    curve.bevel_resolution = 1
    curve.resolution_u = 3
    obj = bpy.data.objects.new(f"L_{ch}", curve)
    bpy.context.scene.collection.objects.link(obj)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.active_object
    obj.name = f"L_{ch}"
    # Face the camera: text lies in XY; stand it up so glTF (+Y up, +Z front) sees it upright.
    obj.rotation_euler = (1.5708, 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    made.append(obj)

# Normalise: every glyph shares one scale (cap height of "I" = CAP) and is centred on its bbox.
ref = next(o for o in made if o.name == "L_I")
cap = ref.dimensions.z
for obj in made:
    obj.scale = (CAP / cap,) * 3
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    obj.location = (0, 0, 0)
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = False

bpy.ops.object.select_all(action="DESELECT")
for obj in made:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=True, export_yup=True,
                          export_texcoords=False, export_cameras=False, export_lights=False)
print({o.name: tuple(round(d, 3) for d in o.dimensions) for o in made})
