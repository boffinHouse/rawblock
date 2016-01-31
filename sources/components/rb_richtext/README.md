#Richtext
<p class=docs-intro>Component richtext creates styling for formatted text that mainly has no additonal style classes. Like markup created by a text/wysiwyg editor. </p>

##Usage
To create a richtext component, add the class `.rb-richtext` to a container element and add your markup inside it.

<h3 class="docs-example-title">Code</h3>

```html
<article class="rb-richtext">
    ...
</article>
```
                  
##Headings
To define headings use `<h1>` to `<h6>` elements.
                   
<h3 class="docs-example-title">Example</h3>
<div class="docs-example">
   <div class="rb-richtext">
        <h1>This is heading h1</h1>
        <h2>This is heading h2</h2>
        <h3>This is heading h3</h3>
        <h4>This is heading h4</h4>
        <h5>This is heading h5</h5>
        <h6>This is heading h6</h6>
    </div>
</div>

<hr>

<h2>Paragraphs</h2>
<p>To define paragraphs use `<p>` element.</p>


<h3 class="docs-example-title">Example</h3>

<div class="docs-example">  
    <p>This is a paragraph.  Paragraphs are usually represented in visual media by blocks of text that are  separated from adjacent blocks by vertical blank space or first-line indention</p>
    <p>This is a paragraph.  Paragraphs are usually represented in visual media by blocks of text that are  separated from adjacent blocks by vertical blank space or first-line indention</p>  
</div>
                
<hr>


##Text level semantics
The following shows some commonly used text-level semantics or inline text element and how to use them.


- `<a>` element: Turns text into a link using the => <a href="#">a element</a>.
- `<em>` element: Emphasize text using the => <em>em element</em>.
- `<strong>` element: Gives text extra importance using the => <strong>strong element</strong>.
- `<sup>` element: Superscript the text higher and smaller using the => <sup>sub element</sup>.
- `<sub>` element: Subscript the text lower and smaller using the => <sub>sub element</sub>.
- `<small>` element: De-emphasize text for small print using the  => <small>small element</small>.
- `<code>` element: Define inline code snippets using the => <code>code element</code>.
- `<del>` element: Mark document changes as deleted using the => <del>code element</del>.
- `<ins>` element: Mark document changes as inserted text using the => <ins>code element</ins>.
- `<mark>` element: Highlicht text with no semantic meaning using the => <mark>mark element</mark>.
- `<q>` element: Define inline quotations using the => <q>q element inside <q>q</q> element</q>.
- `<abbr>` element: Define an abbreviation using the => <abbr title="Abbreviation Element">abbr element</abbr> with title attribute.
- `<dfn>` element: Define a defintion term using the => <def title="Definition Element">def element</def> with title attribute.

<hr>


##Text align
Align text by adding `.richtext-align-*` to an element (for example `<p>`, `<li>` or `<h2>` ect). Text default alignment is left.

<h3 class="docs-example-title">Classes</h3>

| Class name | Description
| ------------- |-------------|
| `.richtext-align-left`  |Text is aligned left|
| `.richtext-align-right`  |Text is aligned right|
|`.richtext-align-center`| Text is aligned center.  |
| `.richtext-align-justify` | Text is aligned justify |

                        
<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    <div class="rb-richtext">
        <p class="richtext-align-left">Paragraph text is aligned left</p>
        <p class="richtext-align-right">Paragraph text is aligned right</p>
        <p class="richtext-align-center">Paragraph text is aligned center</p>
        <p class="richtext-align-justify">Paragraph text is aligned justify</p>
    </div>
</div>
                    
                    
<h3 class="docs-example-title">Code</h3>

```html
<p class="richtext-align-left">...</p>
<p class="richtext-align-right">...</p>
<p class="richtext-align-center">...</p>
<p class="richtext-align-justify">...</p>
```

<hr>


##List
Display content in a list. Create an unordered list using the `<ul>` and ordered list using `<ol>`.
Inside create an list item with `<li>` element.


<div class="use-column-group use-gutters-horizontal">
    <div class="use-size-50">
        <h3 class="docs-example-title">Unordered List</h3>
        <div class="docs-example">
            <div class="rb-richtext">
                <ul>
                    <li>Level 1</li>
                    <li>...
                        <ul>
                            <li>Level 2</li>
                        </ul>
                    </li>
                    <li>...
                        <ol>
                            <li>Level 2</li>
                        </ol>
                    </li>
                </ul>
            </div>
        </div>
       
<h3 class="docs-example-title">Code</h3>
 
```html   
<ul>
    <li>Level 1</li>
    <li>...
        <ul>
            <li>Level 2</li>
        </ul>
    </li>
    <li>...
        <ol>
            <li>Level 2</li>
        </ol>
    </li>
</ul>
```        
</div>

<div class="use-size-50">
        <h3 class="docs-example-title">Ordered List</h3>
        <div class="docs-example">
                <div class="rb-richtext">
                    <ol>
                        <li>Level 1</li>
                        <li>...
                            <ul>
                                <li>Level 2</li>
                            </ul>
                        </li>
                        <li>...
                            <ol>
                                <li>Level 2</li>
                            </ol>
                        </li>
                    </ol>
                </div>
        </div>   
    
<h3 class="docs-example-title">Code</h3>
    
```html    
<ol>
        <li>Level 1</li>
        <li>...
            <ul>
                <li>Level 2</li>
            </ul>
        </li>
        <li>...
            <ol>
                <li>Level 2</li>
            </ol>
        </li>
</ol>
```
</div>
</div>

<hr>

##Description Lists
Creates a association list `<dl>` of name-value groups. A name-value group consist out of a name `<dt>` and one or more values `<dd>`.

<h3 class="docs-example-title">Demo</h3>
<div class="docs-example rb-richtext">
    <dl>
        <dt>Berlin</dt>
        <dd>Is the capital of Germany and one of the 16 states of Germany.</dd>
        <dt>Amsterdam</dt>
        <dd>Is the capital city and most populous city of the Kingdom of the Netherlands.</dd>
    </dl>
</div>

<h3 class="docs-example-title">Code</h3>

```html
<dl>
    <dt>Berlin</dt>
    <dd>Is the capital of Germany and one of the 16 states of Germany.</dd>
    ....
</dl>  
```
            
<hr>

##Blockquote
Quote content from a different source inside your document with the `<blockquote>` element.

<h3 class="docs-example-title">Demo</h3>

<div class="docs-example rb-richtext">
    <blockquote>
        <p>Your great sentence here</p>
        <cite>Your Source</cite>
    </blockquote>
</div>
                    
<h3 class="docs-example-title">Code</h3>

```html
<blockquote>
    <p>Your Content</p>
    <cite>Your source</cite>
</blockquote>
```
                 
<hr>

##Code blocks
Use the `<pre>` element if you want to display formatted content (such as source code). A new
textblock is created that preserves tab indents, double-spaces, newlines, and other typographic formatting.

<h3 class="docs-example-title">Code</h3>

```html
<div class="docs-example">
    <pre>
       <code>...</code>
    </pre>
</div>
```

<hr>

##Tables
Use tables if you want to arrange data.
                  
<h3 class="docs-example-title">Demo</h3>
<div class="docs-example">
    <table>
        <thead>
        <tr>
            <th><strong>Title 1</strong></th>
            <th><strong>Title 2</strong></th>
            <th><strong>Title 3</strong></th>
            <th><strong>Title 4</strong></th>
        </tr>
        </thead>
        <tfoot>
        <tr>
            <td>Footer of table</td>
        </tr>
        </tfoot>
        <tbody>
        <tr>
            <td><a href="#">Ipsum dolor amet,</a> consetetu sadipsci elitr, sed diam</td>
            <td>Ipsum dolor amet, consetetu sadipsci elitr, sed diam</td>
            <td>Ipsum dolor amet, consetetu sadipsci elitr, sed diam</td>
            <td><span class="underline">Ipsum dolor amet</span>, consetetu sadipsci elitr, sed diam</td>
        </tr>
        <tr>
            <td>Ipsum dolor amet, consetetu sadipsci elitr, sed diam</td>
            <td>Ipsum dolor amet, consetetu sadipsci elitr, sed diam</td>
            <td>Ipsum dolor amet, consetetu sadipsci elitr, sed diam</td>
            <td>Ipsum dolor amet, consetetu sadipsci elitr, sed diam</td>
        </tr>
        <tr>
            <td>Ipsum dolor amet, consetetu sadipsci elitr, sed diam</td>
            <td>Ipsum dolor amet, consetetu sadipsci elitr, sed diam</td>
            <td>Ipsum dolor amet, consetetu sadipsci elitr, sed diam</td>
            <td>Ipsum dolor amet, consetetu sadipsci elitr, sed diam</td>
        </tr>
        </tbody>
    </table>
</div>
                  
<h3 class="docs-example-title">Code</h3>

```html
<table>
    <thead>
    <tr>
        <th>...</th>
        ...
    </tr>
    </thead>
    <tfoot>
    <tr>
        <td>...</td>
    </tr>
    </tfoot>
    <tbody>
    <tr>
        <td>...</td>
        ...
    </tr>
    ...
     </tbody>
</table>
```
                