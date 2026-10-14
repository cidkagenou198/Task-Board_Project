import cv2
from PIL import Image
import os

input_path = r"docs\demo\deliverables_walkthrough_fast.mp4"
output_path = r"docs\demo\deliverables_walkthrough.webp"

cap = cv2.VideoCapture(input_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
orig_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Target resolution: 960px width
target_w = 960
target_h = int(h * (target_w / w))

# Sample 1 frame every 6 frames (approx 5 fps)
step = 6
frame_delay_ms = int(1000 / (orig_fps / step))  # preserves real-time speed

frames = []
idx = 0

print(f"Converting {input_path} to animated WebP...")
print(f"Target size: {target_w}x{target_h}, sampling every {step} frames (delay {frame_delay_ms}ms)...")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    if idx % step == 0:
        # Resize frame
        resized = cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_AREA)
        # Convert BGR to RGB
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        im = Image.fromarray(rgb)
        frames.append(im)
    idx += 1

cap.release()

print(f"Collected {len(frames)} frames. Saving animated WebP to {output_path}...")
if frames:
    first_frame = frames[0]
    first_frame.save(
        output_path,
        format="WEBP",
        save_all=True,
        append_images=frames[1:],
        duration=frame_delay_ms,
        loop=0,
        quality=65,
        method=4
    )
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Saved successfully! File size: {size_mb:.2f} MB")
else:
    print("Error: No frames extracted.")
