# The Icons-Folder

Put all your SVG-icons in here you later want to manipulate with CSS, e.g. to change the fill or stroke on `:hover`.

All icons are processed with the svgmin-task and put into the `tmp/svgmin/icons` folder.  
Afterwards the svgstore-task uses these icons to put together an icon-sprite which will be copied to the `assemble/partials` folder. It must be included directly after the opening `<body>` element at the top of the document (have a look at the file `lyt-default.hbs` in the `layouts` folder).

If you have lots of icons it might be a good idea to have more than one SVG-sprite, so you don't need to inject all icons in every page. Therefore you have to edit the svgstore-task in the Gruntfile.js.
