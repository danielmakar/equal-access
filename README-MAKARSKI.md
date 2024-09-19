# Erweietrung im Rahmen der Masterarbeit

Die Erweiterung der Prüf-Engine im Rahmen der Mastararbeit umfasst folgende neue Regeln: 
- [Regel "media_autoplay_controllable"](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/src/v4/rules/media_autoplay_controllable.ts) für Erfolgskriterium 1.4.2
- [Regel "element_tabindex_exists"](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/src/v4/rules/element_tabindex_exists.ts) für Erfolgskriterium 2.4.3 und entsprechende [Regel-Hilfe](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/help-v4/en-US/element_tabindex_exists.html)
- [Regel "content_position_sticky"](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/src/v4/rules/content_position_sticky.ts) für Erfolgskriterium 2.4.11 und entsprechende [Regel-Hilfe](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/help-v4/en-US/content_position_sticky.html)  

Und die Anpassung folgender Regeln: 
- [Regel "aria_child_valid"](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/src/v4/rules/aria_child_valid.ts) für Erfolgskriterium 1.3.1 und entsprechende [Regel-Hilfe](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/help-v4/en-US/aria_child_valid.html)
- [Regel "input_label_exists"](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/src/v4/rules/input_label_exists.ts) für Erfolgskriterium 3.3.2 und entsprechende [Regel-Hilfe](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/help-v4/en-US/input_label_exists.html)
- [Regel "element_id_unique"](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/src/v4/rules/element_id_unique.ts) für Erfolgskriterium 4.1.1 und entsprechende [Regel-Hilfe](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-engine/help-v4/en-US/element_id_unique.html)

Die Erweiterung der Nutzeroberfläche umfasst die Anpassung des Content-Scripts ["viewInspect"](https://github.com/danielmakar/equal-access/blob/master/accessibility-checker-extension/src/ts/contentScripts/viewInspect.ts).

# Notwendige Schritte zum Start der Browsererweiterung

- Installation von [Node.js Version 18](https://nodejs.org/en/download/package-manager)
- Klonen des Repositories:
```bash
$ git clone --branch=master https://github.com/danielmakar/equal-access.git
$ cd equal-access
```
- Installation der Abhängigkeiten: 
```bash
npm install
```
- Bauen und Starten des Regelservers:
```bash
cd rule-server
npm start
```
- Bauen der Browsererweiterung:
```bash
cd accessibility-checker-extension
npm run:build:watch:local
```
- Einbinden der gebauten Erweiterung in den Browser:
1. Starten des Google Chrome Browsers
2. Öffnen des Punktes Erweiterung in den Einstellungen und Aktivierung des Entwicklermodus
3. Einbinden der gebauten Erweiterung (dist-Ordner im Verzeichnis accessibility-checker-extension) über die Schaltfläche "Entpackte Erweiterung laden"

Anschließend ist die Browserweiterung im "Accessibility Assessment (local)"-Tab der Entwicklerwerkzeuge des Browsers aufzufinden.