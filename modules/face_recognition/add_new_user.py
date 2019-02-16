import cv2
import time
from imutils.video import VideoStream
from imutils.video import FPS
import os
i = 0
vs = VideoStream(src=0).start()
fps = FPS().start()
directory = input('Adinizi giriniz: ')
print("[INFO] Merhaba {}.Gulumse cekiyorum".format(directory))
time.sleep(0.5)
if not os.path.exists("dataset/{}".format(directory)):
    os.makedirs("dataset/{}".format(directory))
oldtime = time.time()
while time.time()-oldtime < 5:
    image = vs.read()
    cv2.imwrite('dataset/{}/opencv'.format(directory)+str(i)+'.png', image)
    time.sleep(0.1)
    fps.update()
    i+=1
fps.stop()
print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))
print("[INFO] Fotograf cekimi tamamlandi. Encode islemi basliyor.")
print("[INFO] Bu islem birkac saniye surecek.")
# do a bit of cleanup
cv2.destroyAllWindows()
vs.stop()
