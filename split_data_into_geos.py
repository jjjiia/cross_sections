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

statue = [-74.044502, 40.689247]
statueElevation = 10 #ft
statueHeight = 151
sHeight = statueHeight+statueElevation

root = "data/"

#last step: make new geojson file with visible buildings only

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False
        


def split(geo):
    with open("data/data_"+geo+"_with_centroids_new.csv","Ur") as infile:
        csvReader = csv.reader(infile)
        counter = 0
        for row in csvReader:
           header = row
           print len(row)
           break
        with open("notRightLength_new.csv","a")as notRightLength:
            csvWriter = csv.writer(notRightLength)
            for row in csvReader:
                gid = row[0]
                counter+=1
               # print len(row)
               # print row
               
                if counter%1000==0:
                    print counter
                dictionary = {}
                if len(row)!=len(header):
                    print row
                    csvWriter.writerow(row)
                else:
                    for i in row:
                        index = row.index(i)
                        #if index ==1:
                        #    value = row[1]+" "+row[2]+" "+row[3]+" "+row[4]
                        #    key = "Geo_NAME"
                        #elif index >1 and index <5:
                        #    pass
                        #else:
                        value = row[index]
                        key = header[index]
            
                        dictionary[key]=value
                   # print dictionary
                        #break
               # break
        #                print index, value, key
                    with open("census_"+geo+"/"+gid+".json","w")as outfile:
                        json.dump(dictionary, outfile)

split("blockgroup")
#split("county")
#split("tract")