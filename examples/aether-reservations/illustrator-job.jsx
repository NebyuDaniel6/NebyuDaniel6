#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
var doc = app.documents.add(DocumentColorSpace.RGB, 1080, 1080);
doc.name = "Reservations are open.";
doc.artboards[0].name = "Instagram post 1";
doc.artboards[0].artboardRect = [0, 1080, 1080, 0];
doc.artboards.setActiveArtboardIndex(0);
var layer_0_layer_c88b4968_3b9a_4a27_806c_75ab8df5fb7f = doc.layers.add();
layer_0_layer_c88b4968_3b9a_4a27_806c_75ab8df5fb7f.name = "Background";
layer_0_layer_c88b4968_3b9a_4a27_806c_75ab8df5fb7f.visible = true;
(function(){
  var r = layer_0_layer_c88b4968_3b9a_4a27_806c_75ab8df5fb7f.pathItems.rectangle(1080, 0, 1080, 1080);
  r.name = "Field";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=27;c.green=58;c.blue=47;return c;})();
  r.stroked = false;
})();
var layer_0_layer_64913de8_519c_4a52_9c8d_46c0d96bb226 = doc.layers.add();
layer_0_layer_64913de8_519c_4a52_9c8d_46c0d96bb226.name = "Brand";
layer_0_layer_64913de8_519c_4a52_9c8d_46c0d96bb226.visible = true;
(function(){
  var r = layer_0_layer_64913de8_519c_4a52_9c8d_46c0d96bb226.pathItems.rectangle(983, 97, 75, 15);
  r.name = "Brand rule";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  r.stroked = false;
})();
(function(){
  var t = layer_0_layer_64913de8_519c_4a52_9c8d_46c0d96bb226.textFrames.areaText(
    layer_0_layer_64913de8_519c_4a52_9c8d_46c0d96bb226.pathItems.rectangle(950, 97, 540, 39)
  );
  t.name = "Wordmark";
  t.contents = "Aether Residences";
  var tr = t.textRange;
  tr.characterAttributes.size = 25.392000000000003;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
var layer_0_layer_1ffe65ba_171c_498e_8565_bd3fe5a2b0c5 = doc.layers.add();
layer_0_layer_1ffe65ba_171c_498e_8565_bd3fe5a2b0c5.name = "Typography";
layer_0_layer_1ffe65ba_171c_498e_8565_bd3fe5a2b0c5.visible = true;
(function(){
  var t = layer_0_layer_1ffe65ba_171c_498e_8565_bd3fe5a2b0c5.textFrames.areaText(
    layer_0_layer_1ffe65ba_171c_498e_8565_bd3fe5a2b0c5.pathItems.rectangle(767, 97, 886, 26.599999999999998)
  );
  t.name = "Kicker";
  t.contents = "NEW RESIDENCES";
  var tr = t.textRange;
  tr.characterAttributes.size = 16.0816;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
(function(){
  var t = layer_0_layer_1ffe65ba_171c_498e_8565_bd3fe5a2b0c5.textFrames.areaText(
    layer_0_layer_1ffe65ba_171c_498e_8565_bd3fe5a2b0c5.pathItems.rectangle(729, 97, 886, 265.99125000000004)
  );
  t.name = "Headline";
  t.contents = "Reservations\nare open.";
  var tr = t.textRange;
  tr.characterAttributes.size = 100.50669375000001;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
(function(){
  var t = layer_0_layer_1ffe65ba_171c_498e_8565_bd3fe5a2b0c5.textFrames.areaText(
    layer_0_layer_1ffe65ba_171c_498e_8565_bd3fe5a2b0c5.pathItems.rectangle(431.00874999999996, 97, 886, 34.453125)
  );
  t.name = "Subhead";
  t.contents = "Residences above the avenue.";
  var tr = t.textRange;
  tr.characterAttributes.size = 23.3289;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
var layer_0_layer_1b944fbf_c801_4737_a82c_5908ff828665 = doc.layers.add();
layer_0_layer_1b944fbf_c801_4737_a82c_5908ff828665.name = "Call to action";
layer_0_layer_1b944fbf_c801_4737_a82c_5908ff828665.visible = true;
(function(){
  var r = layer_0_layer_1b944fbf_c801_4737_a82c_5908ff828665.pathItems.rectangle(194, 97, 778, 97);
  r.name = "CTA plate";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  r.stroked = false;
})();
(function(){
  var t = layer_0_layer_1b944fbf_c801_4737_a82c_5908ff828665.textFrames.areaText(
    layer_0_layer_1b944fbf_c801_4737_a82c_5908ff828665.pathItems.rectangle(161.8359375, 97, 778, 39.20625)
  );
  t.name = "CTA label";
  t.contents = "Reservations Are Open";
  var tr = t.textRange;
  tr.characterAttributes.size = 27.653475;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=20;c.green=20;c.blue=20;return c;})();
  tr.paragraphAttributes.justification = Justification.CENTER;
})();
var layer_0_layer_30834280_a251_475a_b33f_d2c19afe621a = doc.layers.add();
layer_0_layer_30834280_a251_475a_b33f_d2c19afe621a.name = "Meta";
layer_0_layer_30834280_a251_475a_b33f_d2c19afe621a.visible = true;
(function(){
  var t = layer_0_layer_30834280_a251_475a_b33f_d2c19afe621a.textFrames.areaText(
    layer_0_layer_30834280_a251_475a_b33f_d2c19afe621a.pathItems.rectangle(248, 97, 886, 27)
  );
  t.name = "Brand name";
  t.contents = "Aether Residences";
  var tr = t.textRange;
  tr.characterAttributes.size = 15.64;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
doc.artboards.add([1160, 1920, 2240, 0]);
doc.artboards[1].name = "Instagram story 1";
doc.artboards.setActiveArtboardIndex(1);
var layer_1_layer_d0703aa8_ed2e_4c4c_a7c8_cd570b6be146 = doc.layers.add();
layer_1_layer_d0703aa8_ed2e_4c4c_a7c8_cd570b6be146.name = "Background";
layer_1_layer_d0703aa8_ed2e_4c4c_a7c8_cd570b6be146.visible = true;
(function(){
  var r = layer_1_layer_d0703aa8_ed2e_4c4c_a7c8_cd570b6be146.pathItems.rectangle(1920, 0, 1080, 1920);
  r.name = "Field";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=27;c.green=58;c.blue=47;return c;})();
  r.stroked = false;
})();
var layer_1_layer_78fdf6fa_be7c_48fc_9b00_769459fc2dd8 = doc.layers.add();
layer_1_layer_78fdf6fa_be7c_48fc_9b00_769459fc2dd8.name = "Brand";
layer_1_layer_78fdf6fa_be7c_48fc_9b00_769459fc2dd8.visible = true;
(function(){
  var r = layer_1_layer_78fdf6fa_be7c_48fc_9b00_769459fc2dd8.pathItems.rectangle(1823, 97, 75, 15);
  r.name = "Brand rule";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  r.stroked = false;
})();
(function(){
  var t = layer_1_layer_78fdf6fa_be7c_48fc_9b00_769459fc2dd8.textFrames.areaText(
    layer_1_layer_78fdf6fa_be7c_48fc_9b00_769459fc2dd8.pathItems.rectangle(1790, 97, 540, 70.2)
  );
  t.name = "Wordmark";
  t.contents = "Aether Residences";
  var tr = t.textRange;
  tr.characterAttributes.size = 45.705600000000004;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
var layer_1_layer_8e66456e_8210_40db_ac55_c171311755d0 = doc.layers.add();
layer_1_layer_8e66456e_8210_40db_ac55_c171311755d0.name = "Typography";
layer_1_layer_8e66456e_8210_40db_ac55_c171311755d0.visible = true;
(function(){
  var t = layer_1_layer_8e66456e_8210_40db_ac55_c171311755d0.textFrames.areaText(
    layer_1_layer_8e66456e_8210_40db_ac55_c171311755d0.pathItems.rectangle(1401, 97, 886, 49)
  );
  t.name = "Kicker";
  t.contents = "NEW RESIDENCES";
  var tr = t.textRange;
  tr.characterAttributes.size = 29.624000000000002;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
(function(){
  var t = layer_1_layer_8e66456e_8210_40db_ac55_c171311755d0.textFrames.areaText(
    layer_1_layer_8e66456e_8210_40db_ac55_c171311755d0.pathItems.rectangle(1331, 97, 886, 386.68875)
  );
  t.name = "Headline";
  t.contents = "Reservations\nare open.";
  var tr = t.textRange;
  tr.characterAttributes.size = 146.11310625000002;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
(function(){
  var t = layer_1_layer_8e66456e_8210_40db_ac55_c171311755d0.textFrames.areaText(
    layer_1_layer_8e66456e_8210_40db_ac55_c171311755d0.pathItems.rectangle(886.31125, 97, 886, 62.1484375)
  );
  t.name = "Subhead";
  t.contents = "Residences above the avenue.";
  var tr = t.textRange;
  tr.characterAttributes.size = 42.08195;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
var layer_1_layer_3543c8c9_f0ee_43da_ad0a_7abf578a14e5 = doc.layers.add();
layer_1_layer_3543c8c9_f0ee_43da_ad0a_7abf578a14e5.name = "Call to action";
layer_1_layer_3543c8c9_f0ee_43da_ad0a_7abf578a14e5.visible = true;
(function(){
  var r = layer_1_layer_3543c8c9_f0ee_43da_ad0a_7abf578a14e5.pathItems.rectangle(270, 97, 778, 173);
  r.name = "CTA plate";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  r.stroked = false;
})();
(function(){
  var t = layer_1_layer_3543c8c9_f0ee_43da_ad0a_7abf578a14e5.textFrames.areaText(
    layer_1_layer_3543c8c9_f0ee_43da_ad0a_7abf578a14e5.pathItems.rectangle(212.81640625, 97, 778, 70.359375)
  );
  t.name = "CTA label";
  t.contents = "Reservations Are Open";
  var tr = t.textRange;
  tr.characterAttributes.size = 49.62681250000001;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=20;c.green=20;c.blue=20;return c;})();
  tr.paragraphAttributes.justification = Justification.CENTER;
})();
var layer_1_layer_1ffa9148_3c57_41d9_a276_02af42dc9e2f = doc.layers.add();
layer_1_layer_1ffa9148_3c57_41d9_a276_02af42dc9e2f.name = "Meta";
layer_1_layer_1ffa9148_3c57_41d9_a276_02af42dc9e2f.visible = true;
(function(){
  var t = layer_1_layer_1ffa9148_3c57_41d9_a276_02af42dc9e2f.textFrames.areaText(
    layer_1_layer_1ffa9148_3c57_41d9_a276_02af42dc9e2f.pathItems.rectangle(366, 97, 886, 48)
  );
  t.name = "Brand name";
  t.contents = "Aether Residences";
  var tr = t.textRange;
  tr.characterAttributes.size = 26.238400000000002;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
doc.artboards.add([2320, 624, 3960, 0]);
doc.artboards[2].name = "Facebook cover 1";
doc.artboards.setActiveArtboardIndex(2);
var layer_2_layer_061b35c5_9249_4bb7_a682_cf4d545b230c = doc.layers.add();
layer_2_layer_061b35c5_9249_4bb7_a682_cf4d545b230c.name = "Background";
layer_2_layer_061b35c5_9249_4bb7_a682_cf4d545b230c.visible = true;
(function(){
  var r = layer_2_layer_061b35c5_9249_4bb7_a682_cf4d545b230c.pathItems.rectangle(624, 0, 1640, 624);
  r.name = "Field";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=27;c.green=58;c.blue=47;return c;})();
  r.stroked = false;
})();
var layer_2_layer_10eb542a_fb94_4434_b98a_d1922982d284 = doc.layers.add();
layer_2_layer_10eb542a_fb94_4434_b98a_d1922982d284.name = "Brand";
layer_2_layer_10eb542a_fb94_4434_b98a_d1922982d284.visible = true;
(function(){
  var r = layer_2_layer_10eb542a_fb94_4434_b98a_d1922982d284.pathItems.rectangle(587, 37, 45, 9);
  r.name = "Brand rule";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  r.stroked = false;
})();
(function(){
  var t = layer_2_layer_10eb542a_fb94_4434_b98a_d1922982d284.textFrames.areaText(
    layer_2_layer_10eb542a_fb94_4434_b98a_d1922982d284.pathItems.rectangle(567.2, 37, 820, 36.4)
  );
  t.name = "Wordmark";
  t.contents = "Aether Residences";
  var tr = t.textRange;
  tr.characterAttributes.size = 23.6992;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
var layer_2_layer_26102be0_4d2a_4662_a900_52ec3599c57a = doc.layers.add();
layer_2_layer_26102be0_4d2a_4662_a900_52ec3599c57a.name = "Typography";
layer_2_layer_26102be0_4d2a_4662_a900_52ec3599c57a.visible = true;
(function(){
  var t = layer_2_layer_26102be0_4d2a_4662_a900_52ec3599c57a.textFrames.areaText(
    layer_2_layer_26102be0_4d2a_4662_a900_52ec3599c57a.pathItems.rectangle(450, 37, 1566, 19.599999999999998)
  );
  t.name = "Kicker";
  t.contents = "NEW RESIDENCES";
  var tr = t.textRange;
  tr.characterAttributes.size = 14;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
(function(){
  var t = layer_2_layer_26102be0_4d2a_4662_a900_52ec3599c57a.textFrames.areaText(
    layer_2_layer_26102be0_4d2a_4662_a900_52ec3599c57a.pathItems.rectangle(422, 37, 1566, 97.02000000000001)
  );
  t.name = "Headline";
  t.contents = "Reservations are open.";
  var tr = t.textRange;
  tr.characterAttributes.size = 73.31940000000002;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
(function(){
  var t = layer_2_layer_26102be0_4d2a_4662_a900_52ec3599c57a.textFrames.areaText(
    layer_2_layer_26102be0_4d2a_4662_a900_52ec3599c57a.pathItems.rectangle(305.98, 37, 1096.1999999999998, 19.375)
  );
  t.name = "Subhead";
  t.contents = "Residences above the avenue.";
  var tr = t.textRange;
  tr.characterAttributes.size = 15.5;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
var layer_2_layer_024a9a62_1f30_4586_816f_8fa204e370f9 = doc.layers.add();
layer_2_layer_024a9a62_1f30_4586_816f_8fa204e370f9.name = "Call to action";
layer_2_layer_024a9a62_1f30_4586_816f_8fa204e370f9.visible = true;
(function(){
  var r = layer_2_layer_024a9a62_1f30_4586_816f_8fa204e370f9.pathItems.rectangle(137, 37, 918, 100);
  r.name = "CTA plate";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  r.stroked = false;
})();
(function(){
  var t = layer_2_layer_024a9a62_1f30_4586_816f_8fa204e370f9.textFrames.areaText(
    layer_2_layer_024a9a62_1f30_4586_816f_8fa204e370f9.pathItems.rectangle(103.828125, 37, 918, 40.387499999999996)
  );
  t.name = "CTA label";
  t.contents = "Reservations Are Open";
  var tr = t.textRange;
  tr.characterAttributes.size = 28.48665;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=20;c.green=20;c.blue=20;return c;})();
  tr.paragraphAttributes.justification = Justification.CENTER;
})();
var layer_2_layer_42aed697_1c1c_427b_b521_36a69217043b = doc.layers.add();
layer_2_layer_42aed697_1c1c_427b_b521_36a69217043b.name = "Meta";
layer_2_layer_42aed697_1c1c_427b_b521_36a69217043b.visible = true;
(function(){
  var t = layer_2_layer_42aed697_1c1c_427b_b521_36a69217043b.textFrames.areaText(
    layer_2_layer_42aed697_1c1c_427b_b521_36a69217043b.pathItems.rectangle(168, 37, 1566, 16)
  );
  t.name = "Brand name";
  t.contents = "Aether Residences";
  var tr = t.textRange;
  tr.characterAttributes.size = 12;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
doc.artboards.add([4040, 3508, 6520, 0]);
doc.artboards[3].name = "A4 poster 1";
doc.artboards.setActiveArtboardIndex(3);
var layer_3_layer_dfcdf306_f92b_49f0_b004_858d770c69a4 = doc.layers.add();
layer_3_layer_dfcdf306_f92b_49f0_b004_858d770c69a4.name = "Background";
layer_3_layer_dfcdf306_f92b_49f0_b004_858d770c69a4.visible = true;
(function(){
  var r = layer_3_layer_dfcdf306_f92b_49f0_b004_858d770c69a4.pathItems.rectangle(3508, 0, 2480, 3508);
  r.name = "Field";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=27;c.green=58;c.blue=47;return c;})();
  r.stroked = false;
})();
var layer_3_layer_c2cfbbfa_e563_4905_9c68_94e451cb24af = doc.layers.add();
layer_3_layer_c2cfbbfa_e563_4905_9c68_94e451cb24af.name = "Brand";
layer_3_layer_c2cfbbfa_e563_4905_9c68_94e451cb24af.visible = true;
(function(){
  var r = layer_3_layer_c2cfbbfa_e563_4905_9c68_94e451cb24af.pathItems.rectangle(3310, 198, 175, 35);
  r.name = "Brand rule";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  r.stroked = false;
})();
(function(){
  var t = layer_3_layer_c2cfbbfa_e563_4905_9c68_94e451cb24af.textFrames.areaText(
    layer_3_layer_c2cfbbfa_e563_4905_9c68_94e451cb24af.pathItems.rectangle(3233, 198, 1240, 127.4)
  );
  t.name = "Wordmark";
  t.contents = "Aether Residences";
  var tr = t.textRange;
  tr.characterAttributes.size = 82.94720000000001;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
var layer_3_layer_b588069c_6759_4e0b_b4d5_3a77ccb93bd8 = doc.layers.add();
layer_3_layer_b588069c_6759_4e0b_b4d5_3a77ccb93bd8.name = "Typography";
layer_3_layer_b588069c_6759_4e0b_b4d5_3a77ccb93bd8.visible = true;
(function(){
  var t = layer_3_layer_b588069c_6759_4e0b_b4d5_3a77ccb93bd8.textFrames.areaText(
    layer_3_layer_b588069c_6759_4e0b_b4d5_3a77ccb93bd8.pathItems.rectangle(2608, 198, 2084, 68.6)
  );
  t.name = "Kicker";
  t.contents = "NEW RESIDENCES";
  var tr = t.textRange;
  tr.characterAttributes.size = 41.473600000000005;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
(function(){
  var t = layer_3_layer_b588069c_6759_4e0b_b4d5_3a77ccb93bd8.textFrames.areaText(
    layer_3_layer_b588069c_6759_4e0b_b4d5_3a77ccb93bd8.pathItems.rectangle(2510, 198, 2084, 550.449375)
  );
  t.name = "Headline";
  t.contents = "Reservations are\nopen.";
  var tr = t.textRange;
  tr.characterAttributes.size = 207.99122812500002;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
(function(){
  var t = layer_3_layer_b588069c_6759_4e0b_b4d5_3a77ccb93bd8.textFrames.areaText(
    layer_3_layer_b588069c_6759_4e0b_b4d5_3a77ccb93bd8.pathItems.rectangle(1854.5506249999999, 198, 2084, 78.271484375)
  );
  t.name = "Subhead";
  t.contents = "Residences above the avenue.";
  var tr = t.textRange;
  tr.characterAttributes.size = 52.999187500000005;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
var layer_3_layer_19249345_6fd4_4bb4_ac2f_49fb678b5a27 = doc.layers.add();
layer_3_layer_19249345_6fd4_4bb4_ac2f_49fb678b5a27.name = "Call to action";
layer_3_layer_19249345_6fd4_4bb4_ac2f_49fb678b5a27.visible = true;
(function(){
  var r = layer_3_layer_19249345_6fd4_4bb4_ac2f_49fb678b5a27.pathItems.rectangle(514, 198, 1786, 316);
  r.name = "CTA plate";
  r.filled = true; r.fillColor = (function(){var c=new RGBColor();c.red=196;c.green=163;c.blue=90;return c;})();
  r.stroked = false;
})();
(function(){
  var t = layer_3_layer_19249345_6fd4_4bb4_ac2f_49fb678b5a27.textFrames.areaText(
    layer_3_layer_19249345_6fd4_4bb4_ac2f_49fb678b5a27.pathItems.rectangle(409.314453125, 198, 1786, 127.95468749999999)
  );
  t.name = "CTA label";
  t.contents = "Reservations Are Open";
  var tr = t.textRange;
  tr.characterAttributes.size = 90.25070625000001;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=20;c.green=20;c.blue=20;return c;})();
  tr.paragraphAttributes.justification = Justification.CENTER;
})();
var layer_3_layer_62302954_9ce9_407e_9c02_4bc80302b375 = doc.layers.add();
layer_3_layer_62302954_9ce9_407e_9c02_4bc80302b375.name = "Meta";
layer_3_layer_62302954_9ce9_407e_9c02_4bc80302b375.visible = true;
(function(){
  var t = layer_3_layer_62302954_9ce9_407e_9c02_4bc80302b375.textFrames.areaText(
    layer_3_layer_62302954_9ce9_407e_9c02_4bc80302b375.pathItems.rectangle(689, 198, 2084, 88)
  );
  t.name = "Brand name";
  t.contents = "Aether Residences";
  var tr = t.textRange;
  tr.characterAttributes.size = 47.3984;
  try { tr.characterAttributes.textFont = app.textFonts.getByName("Inter"); } catch (e) {}
  tr.characterAttributes.fillColor = (function(){var c=new RGBColor();c.red=255;c.green=255;c.blue=255;return c;})();
  tr.paragraphAttributes.justification = Justification.LEFT;
})();
// Caller is responsible for save/export.