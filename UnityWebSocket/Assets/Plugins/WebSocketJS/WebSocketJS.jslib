
﻿var WebSocketJS =
{
	$RECEIVER_NAME:{},
	$OPEN_METHOD_NAME:{},
	$CLOSE_METHOD_NAME:{},
	$RECEIVE_METHOD_NAME:{},
	$ERROR_METHOD_NAME:{},
	$webSocketMap: {},

	$Initialize: function()
	{
		webSocketMap = new Map();
		RECEIVER_NAME = "WebSocketReceiver";
		OPEN_METHOD_NAME = "OnOpen";
		CLOSE_METHOD_NAME = "OnClose";
		RECEIVE_METHOD_NAME = "OnReceive";
		ERROR_METHOD_NAME = "OnError";
	},

	// call by unity
	ConnectJS: function(addressaPtr)
	{
		if(!(webSocketMap instanceof Map))
			Initialize();

		var address = Pointer_stringify(addressaPtr);
		var webSocket = null;
		if(!webSocketMap.has(address))
		{
		  webSocket = new WebSocket(address);
			webSocketMap.set(address, webSocket);
		}
		else
		{
			webSocket = webSocketMap.get(address);
		}

		webSocket.onmessage = function(e)
		{
			if (e.data instanceof Blob)
				OnMessage(address, e.data);
			else
				OnError(address, "msg not a blob instance");
		};

		webSocket.onopen = function(e)
		{
			OnOpen(address);
		};

		webSocket.onclose = function(e)
		{
			OnClose(address);
		};

		webSocket.onerror = function(e)
		{
			OnError(address, e.data)
		};
	},

	// call by unity
	SendJS: function (addressPtr, msgPtr, length)
	{
		var address = Pointer_stringify(addressPtr);
		if(webSocketMap.has(address))
			webSocketMap.get(address).send(HEAPU8.buffer.slice(msgPtr, msgPtr + length));
		else
			OnError(address, "send msg with a WebSocket not Instantiated");
	},

	// call by unity
	CloseJS: function (addressPtr)
	{
		var address = Pointer_stringify(addressPtr);
		if(webSocketMap.has(address))
			webSocketMap.get(address).close();
		else
			OnError(address, "close with a WebSocket not Instantiated");
	},

	$OnMessage: function(address, blobData)
	{
			var reader = new FileReader();
			reader.addEventListener("loadend", function()
			{
				// format : address_data, (address and data split with "_")
				// the data format is hex string
				var msg = address + "_";
				var array = new Uint8Array(reader.result);
				for(var i = 0; i < array.length; i++)
				{
					var b = array[i];
					if(b < 16)
						msg += "0" + b.toString(16);
					else
						msg += b.toString(16);
				}
				SendMessage(RECEIVER_NAME, RECEIVE_METHOD_NAME, msg);
			});
			reader.readAsArrayBuffer(blobData);
	},

	$OnOpen: function(address)
	{
		SendMessage(RECEIVER_NAME, OPEN_METHOD_NAME, address);
	},

	$OnClose: function(address)
	{
		SendMessage(RECEIVER_NAME, CLOSE_METHOD_NAME , address);
	},

	$OnError: function(address, errorMsg)
	{
		var combinedMsg =  address + "_" + errorMsg;
		alert(combinedMsg);
		SendMessage(RECEIVER_NAME, ERROR_METHOD_NAME ,combinedMsg);
	},
};

autoAddDeps(WebSocketJS, '$RECEIVER_NAME');
autoAddDeps(WebSocketJS, '$OPEN_METHOD_NAME');
autoAddDeps(WebSocketJS, '$CLOSE_METHOD_NAME');
autoAddDeps(WebSocketJS, '$RECEIVE_METHOD_NAME');
autoAddDeps(WebSocketJS, '$webSocketMap');
autoAddDeps(WebSocketJS, '$Initialize');
autoAddDeps(WebSocketJS, '$OnMessage');
autoAddDeps(WebSocketJS, '$OnOpen');
autoAddDeps(WebSocketJS, '$OnClose');
autoAddDeps(WebSocketJS, '$OnError');
mergeInto(LibraryManager.library, WebSocketJS);
