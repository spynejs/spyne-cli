const Data = {
  "debug": true,
  "appPath": "./src/app/",
  "init": {
    "promptName": "fileType",
    "type": "Select",
    "message": "Select a file type",
    "choices": [
      "ViewStream",
      "Channel",
      "SpyneTrait",
      "DomElement"
    ]
  },
  "inputTypesArr": [
    "selectFileType",
    "fileName",
    "className",
    "fileDirectory",
    "methodPrefix",
    "channelName",
    "replayLastPayload"
  ],
  "fileTypesArr": [
    "ViewStream",
    "DomElement",
    "Channel",
    "SpyneTrait"
  ],
  "fieldTypesArr": [
    "type",
    "name",
    "format",
    "result",
    "resultFileName",
    "message",
    "choices",
    "initial",
    "hint",
    "validate"
  ],
  "promptTypes": [
    
    {
      "inputType" : "selectFileType",
      "type" : "Select",
      "fields" : [
        "name", 
        "message", 
        "choices", 
        "result"
      ]
      
    },

    {
      "inputType": "fileName",
      "fields": [
        "name",
        "format",
        "result",
        "initial",
        "message",
        "validate"
      ]
    },
    {
      "inputType": "className",
      "fields": [
        "name",
        "format",
        "result",
        "initial",
        "message"
      ]
    },
    {
      "inputType": "fileDirectory",
      "fields": [
        "name",
        "format",
        "result",
        "initial",
        "message",
        "validate"
      ]
    },
    {
      "inputType": "channelName",
      "fields": [
        "name",
        "format",
        "result",
        "initial",
        "message"
      ]
    },
    {
      "inputType": "methodPrefix",
      "fields": [
        "name",
        "format",
        "result",
        "initial",
        "message"
      ]
    },
    {
      "inputType": "replayLastPayload",
      "type" : "Confirm",
      "fields": [
        "name",
        "format",
        "result",
        "message"
      ]
    }
  ],
  "promptProperties": {
    "fileName": [],
    "className": [],
    "fileDirectory": [],
    "methodPrefix": [],
    "channelName": [],
    "replayLastPayload": []
  },
  "promptInputHash": {
    "ViewStream": {
      "path": "components/",
      "props": [
        "fileName",
        "className",
        "fileDirectory"
      ],
      "promptArr": []
    },
    "DomElement": {
      "path": "components/",
      "props": [
        "fileName",
        "className",
        "fileDirectory"
      ],
      "promptArr": []
    },
    "Channel": {
      "path": "channels/",
      "props": [
        "fileName",
        "className",
        "channelName",
        "replayLastPayload",
        "fileDirectory"
      ],
      "promptArr": []
    },
    "SpyneTrait": {
      "path": "traits/",
      "props": [
        "fileName",
        "className",
        "methodPrefix",
        "fileDirectory"
      ],
      "promptArr": []
    }
  }
}


export {Data}