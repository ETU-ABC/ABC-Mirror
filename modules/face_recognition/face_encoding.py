# import the necessary packages
from imutils.video import VideoStream
from imutils.video import FPS
import face_recognition
import imutils
import pickle
import time
import cv2
import requests

#Initial variables
oldtime = time.time()
locked = False
unlocked = True
time.sleep(2)

# load the known faces and embeddings along with OpenCV's Haar
# cascade for face detection
print("[INFO] encode dosyasi + face detector okunuyor.")
data = pickle.loads(open('encodings.pickle', "rb").read())
detector = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

# initialize the video stream and allow the camera sensor to warm up
print("[INFO] starting video stream...")
vs = VideoStream(src=0).start()
time.sleep(2.0)

#hide modules
def unlock():
        requests.get("http://localhost:8080/show_all")
        print("Kilit Acildi")
#Display modules
def lock():
        requests.get("http://localhost:8080/hide_all")
        print("Kilitlendi")
# start the FPS counter
fps = FPS().start()

# loop over frames from the video file stream
while True:
        window = vs.read()
        window = imutils.resize(window, width=1000)
        # grab the frame from the threaded video stream and resize it
        # to 500px (to speedup processing)
        # convert the input frame from (1) BGR to grayscale (for face
        # detection) and (2) from BGR to RGB (for face recognition)
        gray = cv2.cvtColor(window, cv2.COLOR_BGR2GRAY)
        rgb = cv2.cvtColor(window, cv2.COLOR_BGR2RGB)

        # detect faces in the grayscale frame
        rects = detector.detectMultiScale(gray, scaleFactor=1.1,
                minNeighbors=5, minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE)

        # OpenCV returns bounding box coordinates in (x, y, w, h) order
        # but we need them in (top, right, bottom, left) order, so we
        # need to do a bit of reordering
        boxes = [(y, x + w, y + h, x) for (x, y, w, h) in rects]

        # compute the facial embeddings for each face bounding box
        encodings = face_recognition.face_encodings(rgb, boxes)
        names = []
        #if there is no matched face for x second, then lock 
        if (time.time() - oldtime >= 10) and (not locked):
                lock()
                locked = True
                unlocked = True
                
        # loop over the facial embeddings
        for encoding in encodings:
                # attempt to match each face in the input image to our known
                # encodings
                matches = face_recognition.compare_faces(data["encodings"],
                        encoding)
                name = "Unknown"

                # check to see if we have found a match
                if True in matches:
                        #Show modules
                        if unlocked:
                                unlock()
                                unlocked = False
                                
                        # find the indexes of all matched faces then initialize a
                        # dictionary to count the total number of times each face
                        # was matched
                        matchedIdxs = [i for (i, b) in enumerate(matches) if b]
                        counts = {}

                        # loop over the matched indexes and maintain a count for
                        # each recognized face face
                        for i in matchedIdxs:
                                name = data["names"][i]
                                counts[name] = counts.get(name, 0) + 1
                                
                        # determine the recognized face with the largest number
                        # of votes (note: in the event of an unlikely tie Python
                        # will select first entry in the dictionary)
                        name = max(counts, key=counts.get)
                        oldtime = time.time()
                        locked = False
                # update the list of names
                names.append(name)         
        fps.update()

# stop the timer and display FPS information
fps.stop()
print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

# do a bit of cleanup
cv2.destroyAllWindows()
vs.stop()