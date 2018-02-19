![Logo](admin/hombot.png)
# ioBroker.hombot
=================

Dieser Adapter ermöglicht die Steuerung und das Auslesen eines LG HomBot Staubsauger-Roboters bei dem der WLAN-Hack installiert ist.

## Requirements
* Für die Nutzung dieses Adapters ist der WLAN Hack (http://www.roboter-forum.com/showthread.php?10009-LG-Hombot-3-0-WLAN-amp-Kamera-Steuerung-per-Weboberfläche) erforderlich.

## Configuration
* Für die Konfiguration muss mindestens die URL (mit Port) eingetragen werden. Das Polling und dessen Intervall ist optional und wird genutzt um die Status-Werte auszulesen.
![Screenshot](img/settings.png)
* Das Vis-Widget kann für die Steuerung und Anzeige der Statuswerte benutzt werden. Dort muss als Object ID z.B. hombot.0 eingetragen werden.

![Screenshot](img/widget.png)

## Changelog

### 0.0.3
* (AlGu1) Extend ReadMe

### 0.0.2
* (AlGu1) Add many functions and vis widget

### 0.0.1
* (AlGu1) initial release

## License
The MIT License (MIT)

Copyright (c) 2018 Alexander Gurtzick <algu1@outlook.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
