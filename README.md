BBPaginator
===========

BBPaginator is a Backbone.js based paginator. It comes with a jQuery plugin
if you are more familiar with jQuery plugin. 

## Requirements
* jQuery1.6+
* Undersocre1.3.3+
* Backbone.0.9.2+

## Get Started
### Use it as Backbone view. See a complete example:
```
<html>
<head>
    <title>Demo-Use it as a backbone view</title>
    <meta charset="utf-8" />
    <link href="../src/BBPaginator.css" rel="stylesheet">
    <style type="text/css">
      .container{
        padding: 60px;
        width: 600px;
      }
    </style>
    <script type='text/javascript' src='./thirdparties/jquery/jquery-1.10.1.min.js'></script>
    <script type='text/javascript' src='./thirdparties/underscore/underscore-min.js'></script>
    <script type='text/javascript' src='./thirdparties/backbone/backbone.js'></script>
    <script type='text/javascript' src='./thirdparties/bootstrap/js/bootstrap.min.js'></script>
    <script type='text/javascript' src='../src/BBPaginator.js'></script>

</head>
<body>
  <div class="container" style="margin:100px">
    <h1>Use it as a backbone view </h1>
    <div class="pages">
      <h2>This is on page 1</h2>
    </div>
  </div>
</body>
<script type="text/javascript">
  var pager = new BBLib.PaginationModel({
        page: 0,
        firstPage: 0,
        pageSize: 10,
        numOfPages: 10,
        numOfRecords: 100
      });

  var paginator = new BBLib.PaginatorView({model: pager});
  $('.container').append(paginator.render().el);

  pager.on('change:page', function(e, page) {
    $('.pages h2').html('This is on page ' + (page + 1));
  });
</script>
</html>

```
### Use it as a jQuery plugin
```
<html>
<head>
    <title>Demo-Use it as jQuery plugin</title>
    <meta charset="utf-8" />
    <link href="../src/BBPaginator.css" rel="stylesheet">
    <style type="text/css">
      .container{
        padding: 60px;
        width: 600px;
      }
    </style>
    <script type='text/javascript' src='./thirdparties/jquery/jquery-1.10.1.min.js'></script>
    <script type='text/javascript' src='./thirdparties/underscore/underscore-min.js'></script>
    <script type='text/javascript' src='./thirdparties/backbone/backbone.js'></script>
    <script type='text/javascript' src='../build/jQuery-BBPaginator-0.1.0.min.js'></script>

</head>
<body>
  <div class="container" style="margin:100px">
    <h1>Use it as a jQuery plugin</h1>
    <div class="pages">
      <h2>This is on page 1</h2>
    </div>
    <div class="paginator">
    </div>
  </div>
</body>
<script type="text/javascript">
  $('.paginator').paginator({
    onPageChange: function(e, page) {
      $('.pages h2').html('This is on page ' + (page + 1));
    }
  });
</script>
</html>

```


