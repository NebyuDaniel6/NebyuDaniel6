#target photoshop
app.preferences.rulerUnits = Units.PIXELS;
app.displayDialogs = DialogModes.NO;
function fillRect(doc, name, x, y, w, h, rgbArr) {
  var layer = doc.artLayers.add();
  layer.name = name;
  doc.selection.select([[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);
  var c = new SolidColor();
  c.rgb.red = rgbArr[0]; c.rgb.green = rgbArr[1]; c.rgb.blue = rgbArr[2];
  doc.selection.fill(c);
  doc.selection.deselect();
}
function textLayer(doc, name, contents, x, y, size, rgbArr) {
  var layer = doc.artLayers.add();
  layer.kind = LayerKind.TEXT;
  layer.name = name;
  layer.textItem.contents = contents;
  layer.textItem.position = [x, y+size];
  layer.textItem.size = size;
  var c = new SolidColor();
  c.rgb.red = rgbArr[0]; c.rgb.green = rgbArr[1]; c.rgb.blue = rgbArr[2];
  layer.textItem.color = c;
}
function placeImage(doc, name, filePath, x, y, w, h) {
  var f = new File(filePath);
  if (!f.exists) return;
  var src = app.open(f);
  src.resizeImage(UnitValue(w, "px"), UnitValue(h, "px"));
  src.activeLayer.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
  src.close(SaveOptions.DONOTSAVECHANGES);
  app.activeDocument = doc;
  var placed = doc.activeLayer;
  placed.name = name;
  placed.translate(x - placed.bounds[0].as("px"), y - placed.bounds[1].as("px"));
}
(function(){
  var doc = app.documents.add(1080, 1080, 72, "Instagram post 1", NewDocumentMode.RGB, DocumentFill.WHITE);
  fillRect(doc, "Field", 0, 0, 1080, 1080, [27, 58, 47]);
  fillRect(doc, "Brand rule", 97, 97, 75, 15, [196, 163, 90]);
  textLayer(doc, "Wordmark", "Aether Residences", 97, 130, 25.392000000000003, [255, 255, 255]);
  textLayer(doc, "Kicker", "NEW RESIDENCES", 97, 313, 16.0816, [196, 163, 90]);
  textLayer(doc, "Headline", "Reservations are open.", 97, 351, 100.50669375000001, [255, 255, 255]);
  textLayer(doc, "Subhead", "Residences above the avenue.", 97, 648.99125, 23.3289, [255, 255, 255]);
  fillRect(doc, "CTA plate", 97, 886, 778, 97, [196, 163, 90]);
  textLayer(doc, "CTA label", "Reservations Are Open", 97, 918.1640625, 27.653475, [20, 20, 20]);
  textLayer(doc, "Brand name", "Aether Residences", 97, 832, 15.64, [255, 255, 255]);
  try { doc.artLayers.getByName("Background").visible = false; } catch (e) {}
})();
// Document 1/4: Instagram post 1 (1080x1080)
(function(){
  var doc = app.documents.add(1080, 1920, 72, "Instagram story 1", NewDocumentMode.RGB, DocumentFill.WHITE);
  fillRect(doc, "Field", 0, 0, 1080, 1920, [27, 58, 47]);
  fillRect(doc, "Brand rule", 97, 97, 75, 15, [196, 163, 90]);
  textLayer(doc, "Wordmark", "Aether Residences", 97, 130, 45.705600000000004, [255, 255, 255]);
  textLayer(doc, "Kicker", "NEW RESIDENCES", 97, 519, 29.624000000000002, [196, 163, 90]);
  textLayer(doc, "Headline", "Reservations are open.", 97, 589, 146.11310625000002, [255, 255, 255]);
  textLayer(doc, "Subhead", "Residences above the avenue.", 97, 1033.68875, 42.08195, [255, 255, 255]);
  fillRect(doc, "CTA plate", 97, 1650, 778, 173, [196, 163, 90]);
  textLayer(doc, "CTA label", "Reservations Are Open", 97, 1707.18359375, 49.62681250000001, [20, 20, 20]);
  textLayer(doc, "Brand name", "Aether Residences", 97, 1554, 26.238400000000002, [255, 255, 255]);
  try { doc.artLayers.getByName("Background").visible = false; } catch (e) {}
})();
// Document 2/4: Instagram story 1 (1080x1920)
(function(){
  var doc = app.documents.add(1640, 624, 72, "Facebook cover 1", NewDocumentMode.RGB, DocumentFill.WHITE);
  fillRect(doc, "Field", 0, 0, 1640, 624, [27, 58, 47]);
  fillRect(doc, "Brand rule", 37, 37, 45, 9, [196, 163, 90]);
  textLayer(doc, "Wordmark", "Aether Residences", 37, 56.8, 23.6992, [255, 255, 255]);
  textLayer(doc, "Kicker", "NEW RESIDENCES", 37, 174, 14, [196, 163, 90]);
  textLayer(doc, "Headline", "Reservations are open.", 37, 202, 73.31940000000002, [255, 255, 255]);
  textLayer(doc, "Subhead", "Residences above the avenue.", 37, 318.02, 15.5, [255, 255, 255]);
  fillRect(doc, "CTA plate", 37, 487, 918, 100, [196, 163, 90]);
  textLayer(doc, "CTA label", "Reservations Are Open", 37, 520.171875, 28.48665, [20, 20, 20]);
  textLayer(doc, "Brand name", "Aether Residences", 37, 456, 12, [255, 255, 255]);
  try { doc.artLayers.getByName("Background").visible = false; } catch (e) {}
})();
// Document 3/4: Facebook cover 1 (1640x624)
(function(){
  var doc = app.documents.add(2480, 3508, 72, "A4 poster 1", NewDocumentMode.RGB, DocumentFill.WHITE);
  fillRect(doc, "Field", 0, 0, 2480, 3508, [27, 58, 47]);
  fillRect(doc, "Brand rule", 198, 198, 175, 35, [196, 163, 90]);
  textLayer(doc, "Wordmark", "Aether Residences", 198, 275, 82.94720000000001, [255, 255, 255]);
  textLayer(doc, "Kicker", "NEW RESIDENCES", 198, 900, 41.473600000000005, [196, 163, 90]);
  textLayer(doc, "Headline", "Reservations are open.", 198, 998, 207.99122812500002, [255, 255, 255]);
  textLayer(doc, "Subhead", "Residences above the avenue.", 198, 1653.4493750000001, 52.999187500000005, [255, 255, 255]);
  fillRect(doc, "CTA plate", 198, 2994, 1786, 316, [196, 163, 90]);
  textLayer(doc, "CTA label", "Reservations Are Open", 198, 3098.685546875, 90.25070625000001, [20, 20, 20]);
  textLayer(doc, "Brand name", "Aether Residences", 198, 2819, 47.3984, [255, 255, 255]);
  try { doc.artLayers.getByName("Background").visible = false; } catch (e) {}
})();
// Document 4/4: A4 poster 1 (2480x3508)