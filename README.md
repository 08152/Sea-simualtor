# Fishing Simulator — Risky Seas

Kleine, chromebook-freundliche Browser-Spielversion. Alle Projektdateien liegen direkt im Hauptordner – es gibt keine Unterordner und keinen lokalen Asset-Ordner.

## Starten
1. ZIP entpacken.
2. `index.html` öffnen.
3. Internetverbindung eingeschaltet lassen, damit Three.js und die Texturen geladen werden.
4. Im Menü einen Namen eingeben und auf **AUFS MEER FAHREN** drücken.
5. Einmal in das Spiel klicken, damit die Maussteuerung aktiviert wird.

Wenn die Schule das Öffnen von HTML-Dateien oder externe Skripte blockiert, muss die Datei über eine erlaubte Schul-Webumgebung geöffnet werden. Dafür ist kein Build-Schritt nötig.

## Steuerung
- **WASD**: auf dem Deck laufen; am Steuer Boot bewegen
- **Maus**: umsehen
- **E**: interagieren
- **Linksklick**: Timing-Minigame / Mauslinie im Verarbeitungs-Minispiel
- **ESC**: zurück zum Hauptmenü

## Enthalten
- 3D-Meer und große deterministische Insel-/Hafenkarte
- Fischkutter mit Kajüte, animierter Tür, Steuerstand, Kran/Einholgerät, Seil, Boje, Metalltisch und Fischkiste
- Auswerfen, Wartezeit, Fang-Timing-Minispiel und vier stilisierte Fischtypen
- Stilisiertes Linienführungs-Minispiel für jeden unbearbeiteten Fisch (ohne grafische Darstellung)
- Credits, Verkauf, Köderkauf und Browser-Speicherung
- Internet-Texturen mit automatisch erzeugten Fallbacks

## Texturen und Lizenzen
Die verwendeten Material-URLs zeigen CC0-Texturen von Poly Haven:
- Wooden Planks: https://polyhaven.com/a/wooden_planks
- Wood Planks: https://polyhaven.com/a/wood_planks
- Rusty Metal: https://polyhaven.com/a/rusty_metal
- Grass Ground: https://polyhaven.com/a/grass_ground
- Concrete Floor: https://polyhaven.com/a/concrete_floor
- Fish scales: https://commons.wikimedia.org/wiki/File:Fish_scales.jpg (Rajesh Dangi; CC BY-SA 3.0 / GFDL, Lizenzwahl laut Dateiseite)

Die Oberflächentexturen werden zur Laufzeit direkt aus dem Internet geladen, nicht in diesem ZIP gespeichert. Die Fish-Scales-Textur wird nur als dezente Oberflächenstruktur genutzt. Wasserwellen, Fische und Teile der Umgebung werden zusätzlich prozedural erzeugt.

## Hinweise
Dies ist ein erster spielbarer Prototyp. Die Karte verwendet einen festen Seed, sodass dieselbe Welt beim erneuten Start gleich bleibt. Die Spielmechaniken sind bewusst leichtgewichtig, damit sie auf einem Chromebook laufen können.
