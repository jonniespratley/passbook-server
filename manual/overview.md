This project aims to ease the process of creating Apple Wallet Passes.



## Author
jonniespratley

## License
MIT



https://developer.apple.com/library/content/documentation/PassKit/Reference/PassKit_WebService/WebService.html#//apple_ref/doc/uid/TP40011988




Registering a Device to Receive Push Notifications for a Pass

POST request to webServiceURL/version/devices/deviceLibraryIdentifier/registrations/passTypeIdentifier/serialNumber

Parameters

webServiceURL
The URL to your web service, as specified in the pass.
version
The protocol version—currently, v1.
deviceLibraryIdentifier
A unique identifier that is used to identify and authenticate this device in future requests.
passTypeIdentifier
The pass’s type, as specified in the pass.
serialNumber
The pass’s serial number, as specified in the pass.
Header

The Authorization header is supplied; its value is the word ApplePass, followed by a space, followed by the pass’s authorization token as specified in the pass.

Payload

The POST payload is a JSON dictionary containing a single key and value:

pushToken
The push token that the server can use to send push notifications to this device.
Response

If the serial number is already registered for this device, returns HTTP status 200.
If registration succeeds, returns HTTP status 201.
If the request is not authorized, returns HTTP status 401.
Otherwise, returns the appropriate standard HTTP status.
