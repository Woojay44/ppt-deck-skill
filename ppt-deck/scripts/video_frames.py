"""Sample frames from a video: video_frames.py VIDEO OUTDIR STEP_SECONDS"""
import sys, pathlib, cv2
v, out, step = sys.argv[1], pathlib.Path(sys.argv[2]), float(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
cap = cv2.VideoCapture(v); fps = cap.get(cv2.CAP_PROP_FPS); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"fps={fps:.1f} frames={n} dur={n/fps:.0f}s size={int(cap.get(3))}x{int(cap.get(4))}")
t = 0.0
while t < n / fps:
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, f = cap.read()
    if ok: cv2.imencode(".png", f)[1].tofile(str(out / f"t{int(t):04d}.png"))
    t += step
