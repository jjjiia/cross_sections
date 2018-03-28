from functools import partial
import random
import pprint
import pylab
import csv
import math
import json
from math import radians, cos, sin, asin, sqrt
from shapely.geometry import *
from shapely.ops import cascaded_union
from operator import itemgetter
import time

def getCentroids(geofileName):
    with open("data/"+geofileName+"_centroids.geojson", "r")as infile:
        centroids = json.load(infile)
        centroidsDictionary = {}
        for f in centroids["features"]:
            gid = f["properties"]["AFFGEOID"].replace("00000US","000US")
            coords = f["geometry"]["coordinates"]
            centroidsDictionary[gid]=coords
            
       # with open("data/centroidsById.json","w")as outfile:
       #     json.dump(centroidsDictionary,outfile)
    return centroidsDictionary
       
def addCentroidsToCsv(geofileName):
    centroids = getCentroids(geofileName)
    with open("data/R11627393_"+geofileName+".csv","Ur")as infile:
        csvReader = csv.reader(infile)
        for row in csvReader:
            header = row
            break
            
        newHeader = header+["lng","lat"]
        count = 0
        with open("data/data_"+geofileName+"_with_centroids.csv","w")as outfile:
            csvWriter = csv.writer(outfile)
            csvWriter.writerow([newHeader])

            csvReader.next()
        
            for row in csvReader:
                count+=1
                if count%100==0:
                    print count
               # print row
                gid = row[0]
               # print gid
                if gid in centroids.keys():
                    
                    coordinates = centroids[gid]
                    #print coordinates
                    newRow = row+coordinates
                    csvWriter.writerow([newRow])

       
#getCentroids("blockGroup")
#addCentroidsToCsv("blockgroup")
addCentroidsToCsv("tract")