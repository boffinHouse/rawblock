#Layout Utility
<p class="docs-intro">
    RawBlock provides a layout system that is responsive, fluid and uses a human readable syntax.
    This is archieved with the use of utility classes. These classes only provide one functionality and are recognizable by the prefix `.use-*` for example `.use-size-50` or `.use-gutters`.
</p>

##Sizes
Rawblock uses 24 width units, who are named `.use-size-%`. Ranging from **5%** to **100%** with **5%** increments and adjust the width for
all screensizes

| Class name | Description
| ------------- |-------------|
| `.use-size-*`  | Use to define width on a element for all screensizes. Ranging from **5%** to **100%** with **5%** increments. |
|`.use-size-16`| Defines width of 1/6 |
| `.use-size-33` | Defines width of 1/3 |
| `.use-size-66` | Defines width of 2/3 |
| `.use-size-auto` | Defines width on amount content |                 

<h3 class="docs-example-title">Demo</h3>

<div class="docs-example">
    <div>
        <div class="use-size-20">
            <div class="docs-item">20%</div>
        </div>
        <div class="use-size-30">
            <div class="docs-item">30%</div>
        </div>
        <div class="use-size-50">
            <div class="docs-item">50%</div>
        </div>
    </div>
</div>
                   
<h3 class="docs-example-title">Code</h3>

```html
<div class="use-size-20">...</div>
<div class="use-size-30">...</div>
<div class="use-size-50">...</div>
```
                    
<hr>

##Columns Grid
The `.use-size-*` classes only sizes an element. To apply a column grid you must wrap them inside an `.use-column-group` container.

This will create a flex container. By default, all columns will be aligned to the left and equally matched in height.

<h3 class="docs-example-title">Demo</h3>

<div class="docs-example">
    <div class="use-column-group">
        <div class="use-size-20">
            <div class="docs-item">20%</div>
        </div>
        <div class="use-size-30">
            <div class="docs-item">30%</div>
        </div>
        <div class="use-size-50">
            <div class="docs-item">50%</div>
        </div>
    </div>
</div>
                   
<h3 class="docs-example-title">Code</h3>

```html
<div classs="use-column-group">
    <div class="use-size-20">...</div>
    <div class="use-size-30">...</div>
    <div class="use-size-50">...</div>
</div>    
```

Best practice is to put the RawBlock component `rb-yourcomponent` always inside an `use-size-*` column. This prevents strange side effect and will be better maintainable for future improvements. 

<hr>

##Gutters
Gutters are the space between layout columns. Gutters are set by adding the `use-gutters`
on the parent element of `use-size-*` columns, usualy the `use-column-group`. If you only
want horizontal gutters use `use-gutters-horizontal` and only vertical use `use-gutters-vertical`.

Gutters are only set in conjunction with `use-size-*` as direct children. Nested children are untouched.
              
<h3 class="docs-example-title">Classes</h3>

| Class name | Description
| ------------- |-------------|
| `.use-gutters`  | Creates horizontal/vertical space between layout columns. |
|`.use-gutters-horizontal`| Creates horizontal space between columns.  |
| `.use-gutters-vertical` | Creates vertical (bottom only) space between columns. |

                 
<h3 class="docs-example-title">Demo</h3>

<div class="docs-example">
    <div class="use-column-group use-gutters-horizontal">
        <div class="use-size-40">
            <div class="docs-item">40%</div>
        </div>
        <div class="use-size-40">
            <div class="docs-item">40%</div>
        </div>
        <div class="use-size-20">
            <div class="docs-item">20%</div>
        </div>
    </div>
</div>

                   
<h3 class="docs-example-title">Code</h3>

```html
<div class="use-column-group use-gutters-horizontal">
    <div class="use-size-40">...</div>
    <div class="use-size-40">...</div>
    <div class="use-size-20">...</div>
</div>
```

<hr>

##Nested Columns Grid
You can infinitely nest columns within columns by creating colum-groups `use-column-group` inside a column `use-size-*`.

<h3 class="docs-example-title">Demo</h3>

<div class="docs-example">
    <div class="use-column-group">
        <div class="use-size-50">
            <div class="use-column-group use-gutters-horizontal">
            	<div class="use-size-50">
            		<div class="docs-item" style="background:#aaa;">Nested 50%</div>
            	</div>
            	<div class="use-size-50">
	            	<div class="docs-item" style="background:#aaa;">Nested 50%</div>
            	</div>
            </div>
        </div>
        <div class="use-size-50">
            <div class="docs-item">50%</div>
        </div>
    </div>
</div>

<h3 class="docs-example-title">Code</h3>

```html
<div class="use-column-group">
    <div class="use-size-50">...</div>
    <div class="use-size-50">
    	<div class="use-column-group">
    		<div class="use-size-50">..</div>
    		<div class="use-size-50">..</div>
    	</div>
    </div>
</div>
```

<hr>

##Breakpoint classes
RawBlock provides a **breakpointconfig** where you easy can customize how your layout behaves at specific breakpoints by simple adding breakpoint classes to your markup. 

RawBlock default responsive layout comes with the following keys and media breakpoints. 

<h3 class="docs-example-title">Default Breakpoints</h3>

| Key | Media breakpoint | Description 
| ------------- |------------------| ------------- |-------------|-------------|
| `all`  | none | Affects all screen sizes. No suffix is needed. For example `.use-size-50` (**required**)|
|`l` |(min-width: 1240px) | Affects screens sizes above 1240px. Suffixed with `-l`. For example `.use-size-50-l`  |
| `m` |(min-width:768px)| Affects screen sizes of 768px and higher. Suffixed with `-m`. For example `.use-size-50-m` |
| `s`|(max-width:767px) | Affects screen sizes beneath to 767px. Suffixed with `-s`. For example `.use-size-50-s`  |
                   
You can change the keys and breakpoints of `l`, `m` and `s` or add new keys and breakpoints. Key `all` is **required** and can not be changed.   
                   
Next to media breakpoints (set with property `media`) you can control additional settings, like `gutter`.
                      
<h3 class="docs-example-title">Breakpoint Options</h3>

| property name | Description
| ------------- |-------------|
| `media`  | Set media query for specific key |
|`gutter: horizontal / vertical`| Set horizontal/vertical gutter space on `.use-size-*` columns.  |
  
                    
<h3 class="docs-example-title">BreakpointConfigs</h3>

```css
$breakpointConfigs: (
    all: (
        gutter: (
        	vertical: 40px,
        	horizontal: 40px
        )
    ),
    l: (
        media:'(min-width: 1240px)'
    ),
    m: (
        media:'(min-width: 768px)',
        gutter: (
            vertical: 20px,
            horizontal: 20px
        )
    ),
    s: (
        media: '(max-width: 767px)',
        gutter: (
            vertical: 10px,
            horizontal: 10px
        )
    )
);
```

<hr>