import cv2
import time
from imutils.video import VideoStream
from imutils.video import FPS
import os
i = 0
vs = VideoStream(src=0).start()
fps = FPS().start()
directory = input('What is your name: ')
if not os.path.exists("dataset/{}".format(directory)):
    os.makedirs("dataset/{}".format(directory))
oldtime = time.time()
while time.time()-oldtime < 10:
    image = vs.read()
    cv2.imwrite('dataset/{}/opencv'.format(directory)+str(i)+'.png', image)
    time.sleep(0.4)
    fps.update()
    i+=1
fps.stop()
print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

# do a bit of cleanup
cv2.destroyAllWindows()
vs.stop()
