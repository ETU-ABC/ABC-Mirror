import cv2
import time
from imutils.video import VideoStream
from imutils.video import FPS
import argparse
import os

# Parse name
parser = argparse.ArgumentParser()
parser.add_argument("--name")
args = vars(parser.parse_args())
directory = args["name"]

# Count for saving files
i = 0

# Video stream
vs = VideoStream(src=1).start()
fps = FPS().start()


print("[INFO] Merhaba {}.Gulumse cekiyorum".format(directory))
time.sleep(0.5)

if not os.path.exists("modules/face_recognition/dataset"):
    os.makedirs("modules/face_recognition/dataset/{}".format(directory))
oldtime = time.time()
while time.time()-oldtime < 3:
    image = vs.read()
    cv2.imwrite('modules/face_recognition/dataset/{}/opencv'.format(directory)+str(i)+'.png', image)
    time.sleep(0.1)
    fps.update()
    i+=1

fps.stop()

print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))
print("[INFO] Fotograf cekimi tamamlandi")
# do a bit of cleanup
cv2.destroyAllWindows()
vs.stop()
