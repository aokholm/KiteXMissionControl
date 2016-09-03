
var synaptic = require('synaptic') // this line is not needed in the browser
var Network = synaptic.Network

var storedNetwork = {
  "neurons": [
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 0,
      "old": 0,
      "activation": 0.5336917638920021,
      "bias": 0,
      "layer": "input",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 0,
      "old": 0,
      "activation": 0.7132624950337347,
      "bias": 0,
      "layer": "input",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 0,
      "old": 0,
      "activation": -3.8273364477309832,
      "bias": 0,
      "layer": "input",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 39.96787007489229,
      "old": 40.17026890038993,
      "activation": 1,
      "bias": 22.023215766018968,
      "layer": "0",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": -6.399836238798396,
      "old": -6.32889667652104,
      "activation": 0.0016590722989570435,
      "bias": 3.6529804116929725,
      "layer": "0",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 3.628660020192588,
      "old": 3.7106461295399296,
      "activation": 0.9741350208097234,
      "bias": 2.976162709053624,
      "layer": "0",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 0.4076456954879273,
      "old": 0.41807709124667447,
      "activation": 0.600523226669669,
      "bias": 11.422685435138892,
      "layer": "0",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 10.344368872827708,
      "old": 10.367187072947983,
      "activation": 0.9999678275816597,
      "bias": -1.0617503420284837,
      "layer": "0",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 7.640986034315727,
      "old": 7.756632613312009,
      "activation": 0.9995198760573573,
      "bias": 22.05596157423557,
      "layer": "0",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": -2.1609500509392445,
      "old": -2.2026585115114847,
      "activation": 0.10331240655858202,
      "bias": 4.467477839458712,
      "layer": "0",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 2.7787509463419484,
      "old": 2.8747554907376833,
      "activation": 0.9415167057346668,
      "bias": 5.8341232451303835,
      "layer": "0",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 18.116130948356837,
      "old": 18.213114487803985,
      "activation": 0.9999999864398563,
      "bias": 31.303742132794266,
      "layer": "0",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": -0.5148961642172716,
      "old": -0.4837859517478127,
      "activation": 0.3740464535795233,
      "bias": 10.439284134617129,
      "layer": "0",
      "squash": "LOGISTIC"
    },
    {
      "trace": {
        "elegibility": {},
        "extended": {}
      },
      "state": 0.2781252686659025,
      "old": 0.2725074567928905,
      "activation": 0.5690865487780862,
      "bias": 0.28956338845810037,
      "layer": "output",
      "squash": "LOGISTIC"
    }
  ],
  "connections": [
    {
      "from": "0",
      "to": "3",
      "weight": 26.866123377746977,
      "gater": null
    },
    {
      "from": "0",
      "to": "4",
      "weight": 8.850095665675749,
      "gater": null
    },
    {
      "from": "0",
      "to": "5",
      "weight": 8.902747142519015,
      "gater": null
    },
    {
      "from": "0",
      "to": "6",
      "weight": 13.148677604264876,
      "gater": null
    },
    {
      "from": "0",
      "to": "7",
      "weight": 7.113627377110063,
      "gater": null
    },
    {
      "from": "0",
      "to": "8",
      "weight": 3.5192403622432624,
      "gater": null
    },
    {
      "from": "0",
      "to": "9",
      "weight": -8.799674036582319,
      "gater": null
    },
    {
      "from": "0",
      "to": "10",
      "weight": 18.90899565484442,
      "gater": null
    },
    {
      "from": "0",
      "to": "11",
      "weight": -8.114523780394103,
      "gater": null
    },
    {
      "from": "0",
      "to": "12",
      "weight": -6.599783884820928,
      "gater": null
    },
    {
      "from": "1",
      "to": "3",
      "weight": -25.67410196470251,
      "gater": null
    },
    {
      "from": "1",
      "to": "4",
      "weight": -18.742598639576926,
      "gater": null
    },
    {
      "from": "1",
      "to": "5",
      "weight": -14.656225153275825,
      "gater": null
    },
    {
      "from": "1",
      "to": "6",
      "weight": -6.2762146021523,
      "gater": null
    },
    {
      "from": "1",
      "to": "7",
      "weight": 3.368837630701262,
      "gater": null
    },
    {
      "from": "1",
      "to": "8",
      "weight": -31.33031039443849,
      "gater": null
    },
    {
      "from": "1",
      "to": "9",
      "weight": 2.98096343542667,
      "gater": null
    },
    {
      "from": "1",
      "to": "10",
      "weight": -17.906942598260944,
      "gater": null
    },
    {
      "from": "1",
      "to": "11",
      "weight": -28.890960682565286,
      "gater": null
    },
    {
      "from": "1",
      "to": "12",
      "weight": -13.946128117828149,
      "gater": null
    },
    {
      "from": "2",
      "to": "3",
      "weight": -5.726906912652545,
      "gater": null
    },
    {
      "from": "2",
      "to": "4",
      "weight": 0.367787668281114,
      "gater": null
    },
    {
      "from": "2",
      "to": "5",
      "weight": -1.6604002006493788,
      "gater": null
    },
    {
      "from": "2",
      "to": "6",
      "weight": 3.541834479865632,
      "gater": null
    },
    {
      "from": "2",
      "to": "7",
      "weight": -1.3604158948568987,
      "gater": null
    },
    {
      "from": "2",
      "to": "8",
      "weight": -1.5816665998365524,
      "gater": null
    },
    {
      "from": "2",
      "to": "9",
      "weight": 1.0603519719575216,
      "gater": null
    },
    {
      "from": "2",
      "to": "10",
      "weight": 0.09787406785446492,
      "gater": null
    },
    {
      "from": "2",
      "to": "11",
      "weight": -3.069989321790249,
      "gater": null
    },
    {
      "from": "2",
      "to": "12",
      "weight": -0.6571985963855137,
      "gater": null
    },
    {
      "from": "3",
      "to": "13",
      "weight": 1.363721989859143,
      "gater": null
    },
    {
      "from": "4",
      "to": "13",
      "weight": -1.2268775554695848,
      "gater": null
    },
    {
      "from": "5",
      "to": "13",
      "weight": 1.8371184933904166,
      "gater": null
    },
    {
      "from": "6",
      "to": "13",
      "weight": -0.9992066364124937,
      "gater": null
    },
    {
      "from": "7",
      "to": "13",
      "weight": -2.1765008158193635,
      "gater": null
    },
    {
      "from": "8",
      "to": "13",
      "weight": -3.228197763756155,
      "gater": null
    },
    {
      "from": "9",
      "to": "13",
      "weight": 2.0456730578809212,
      "gater": null
    },
    {
      "from": "10",
      "to": "13",
      "weight": -1.2112601317270986,
      "gater": null
    },
    {
      "from": "11",
      "to": "13",
      "weight": 3.3877770247866015,
      "gater": null
    },
    {
      "from": "12",
      "to": "13",
      "weight": 1.0204630511702273,
      "gater": null
    }
  ]
}

module.exports.network = Network.fromJSON(storedNetwork)
