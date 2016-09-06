import json
from pprint import pprint

import matplotlib.pyplot as plt
import numpy as np

from mpl_toolkits.mplot3d import Axes3D

with open('sessions/2016-09-05T09:56:27.739Z-session.json') as data_file:
    data = json.load(data_file)


# def lowpassFilter(vector, alpha):
#     output = []
#     output.append(vector[0])
#     for element in vector[1:]:
#         if element is None or output[-1] is None:
#             output.append(element)
#         else:
#             output.append(output[-1]*(1-alpha) + element*alpha)
#
#     return output

#pprint(data)


#
#
# # DOWNLOAD DATA
# mainUrl = 'https://project-5747199377705571541.firebaseio.com/video'
#
# response = urllib.urlopen(mainUrl + '.json?shallow=true')
# data = json.loads(response.read())
# key = sorted(data.keys())[-1]
#
# response = urllib.urlopen(mainUrl + '/' + key +'.json')
# kinematics = json.loads(response.read())

kinematics = data['kinematic']
controls = data['control']
pprint(kinematics[0])
pprint(controls[0])


# GENERAL

# TIME
t = [kinematic['t'] for kinematic in kinematics]

# POSITION
x = [kinematic['pos']['x'] for kinematic in kinematics]
y = [kinematic['pos']['y'] for kinematic in kinematics]
d = [kinematic['pos']['dir'] for kinematic in kinematics]

# PLOT

# TIMEDELTAS
if False:
    deltas = []
    previousTime = kinematics[0]['t']

    for k in kinematics[1:]:
        deltas.append(k['t'] - previousTime)
        previousTime = k['t']

    plt.plot(deltas)
    plt.show()


# # POSITION 2D Plot
# if True:
#     plt.figure(2)
#     plt.subplot(311)
#     plt.plot(x)
#     plt.subplot(312)
#     plt.plot(y)
#     # plt.subplot(313)
#     # plt.plot(z)
#     plt.show()

# POSITION 2D Plot
if True:
    plt.figure()
    plt.plot(x,y)
    plt.show()

# 3DPlot
if False:
    N = 101
    alpha = np.linspace(-np.pi/2, np.pi/2, N)
    r = 45
    sinA = np.sin(alpha)*r
    cosA = np.cos(alpha)*r
    zeroA = np.zeros(N)


    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    plt.plot(x,y,z)
    plt.plot([0],[0],[0], 'ro')
    plt.plot(sinA,cosA,zeroA, 'k')
    plt.plot(sinA,zeroA,cosA, 'k')
    plt.xlim([-r,r])
    plt.ylim([-r,r])
    ax.set_zlim([-r,r])

    plt.show()

# Position Derivertives - angular rotation & velocity
if False:
    fig = plt.figure()
    plt.subplot(311)
    plt.plot(t, [kinematic['av'] for kinematic in kinematics])
    plt.plot(t, lowpassFilter([kinematic['av'] for kinematic in kinematics], 0.2))
    plt.subplot(312)
    plt.plot(t, [k['vel']['x'] for k in kinematics])
    plt.plot(t, [k['vel']['y'] for k in kinematics])
    plt.plot(t, [k['vel']['z'] for k in kinematics])
    plt.plot(t, [np.sqrt(k['vel']['x']*k['vel']['x']+k['vel']['y']*k['vel']['y']+k['vel']['z']*k['vel']['z']) for k in kinematics])
    plt.subplot(313)
    plt.plot(t, x)
    plt.plot(t, y)
    plt.plot(t, z)
    plt.show()
