import urllib.request
import board
import neopixel
import time
import datetime
import json

LED_COUNT = 117
LED_PIN	= board.D18
LED_BRIGHTNESS = 0.5
LED_ORDER = neopixel.RGB
UPDATED = False
settings = json.loads(open("/home/aj/lights/settings.json", "r").read())
CID = settings['id']
print("Running test.py at " + datetime.datetime.now().strftime('%d/%m/%Y %H:%M'))

pixels = neopixel.NeoPixel(LED_PIN, LED_COUNT, brightness = LED_BRIGHTNESS, pixel_order = LED_ORDER, auto_write = False)
pixels.fill((255, 255, 255))
pixels.show()

def getSubs():
	global settings
	global CID
	global UPDATED
	url = settings['api']+""+CID+""
	req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
	content = urllib.request.urlopen(req).read()
	content = json.loads(content)
	content['path'] = settings['path']
	if settings['api'] == "https://axern.space/api/get?platform=youtube&type=channel&id=":
		open("/home/aj/lights/user.json", "w").write(json.dumps(content))
	else:
		req2 = urllib.request.Request("https://axern.space/api/get?platform=youtube&type=channel&id="+CID, headers={'User-Agent': 'Mozilla/5.0'})
		content2 = urllib.request.urlopen(req2).read()
		content2 = json.loads(content2)
		content['snippet'] = content2['snippet']
		content['brandingSettings'] = content2['brandingSettings']
		content['path'] = settings['path']
		open("/home/aj/lights/user.json", "w").write(json.dumps(content))
	if settings['path'] == 'counts[0]':
		return content['counts'][0]
	elif settings['path'] == 'counts[0].count':
		return content['counts'][0]['count']
	elif settings['path'] == 'items[0].statistics.subscriberCount':
		return content['items'][0]['statistics']['subscriberCount']
	else:
		return content[settings['path']]

def setLights(subs): 
	global settings
	global pixels
	global UPDATED
	color = hex_to_rgb(settings['color'])
	pixels.fill((0, 0, 0))
	pixels.show()
	subs = str(subs)
	length = len(subs)
	numbers = {"0":{0,1,2,3,4,5,6,7,8,9,10,11},"1":{0,1,2,3,4},"2": {0,11,10,9,8,12,2,3,4,5,6},"3":{0,2,4,5,6,7,8,9,10,11,12}, "4":{0,1,2,6,7,8,9,10,12},"5":{0,1,2,12,4,5,6,7,8,10,11},"6":{0,1,2,3,4,5,6,7,8,10,11,12},"7":{0,11,10,9,8,7,6},"8":{0,1,2,3,4,5,6,7,8,9,10,11,12},"9":{0,1,2,4,5,6,7,8,9,10,11,12}}
	currentNum = 1
	for i in range(0, length):
		for j in numbers[subs[i]]:
			pixels[currentNum + j-1] = color
		currentNum = currentNum + 13
	pixels.show()

def reset():
	pixels.fill((0, 0, 0))
	pixels.show()

def hex_to_rgb(value):
	value = value.lstrip('#')
	lv = len(value)
	return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))

def update():
	global settings
	global CID
	global UPDATED
	settings = json.loads(open("/home/aj/lights/settings.json", "r").read())
	settings['autoUpdate'] = str(settings['autoUpdate'])
	if settings['id'] != CID:
		CID = settings['id']
		UPDATED = False
	if settings['autoUpdate'] == 'True':
		subs = getSubs()
		setLights(subs)
	else:
		if UPDATED == False:
			subs = getSubs()
			setLights(subs)
			UPDATED = True

#while True:
	#update()
	#settings = json.loads(open("/home/aj/lights/settings.json", "r").read())
	#time.sleep(int(settings['interval']))