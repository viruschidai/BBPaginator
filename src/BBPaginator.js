;/**
  * @author billg(viruschidai@gmail.com)
  * This is a backbone.js based paginator.
  */
(function() {
  var BBLib;

  if (!this.BBLib) {
    BBLib = this.BBLib = {}
    BBLib.VERSION = "0.1.0";
  } else {
    BBLib = this.BBLib;
  }

  BBLib.PaginationModel = Backbone.Model.extend({
    defaults: {
      pageSize: 10,
      page: 0,
      numOfPages: 0,
      numOfRecords: 0
    },

    initialize: function() {
      this.on("change:numOfRecords change:pageSize", function() {
        var pageSize = this.get("pageSize"),
          numOfRecords = this.get("numOfRecords"),
          numOfPages = this.get("pageSize") === 0 ? (numOfRecords > 0 ? 1 : 0) : Math.ceil(numOfRecords / pageSize);

        this.set("numOfPages", numOfPages);

        if (this.get("page") >= numOfPages) {
          this.set("page", (numOfPages - 1));
        }
      });
    },

    queryParamsMap: {},

    toQueryParams: function() {
      var params = _.extend({}, this.attributes);
      if (!_.empty(this.queryParamsMap)) {
        _.each(this.queryParamsMap, function(key, value) {
          if (! value in this.attributes) {
            throw new Error(value + " is not a valid property.");
          };
          params[key] = this.attributes[value];
        });
      };

      return params;
    },

    validate: function(attrs, options) {
      if (attrs.pageSize < 0) {
          return "Invalid pageSize value [" + attrs.pageSize + "]";
      };

      if (attrs.page < 0 || attrs.page > this.get('numOfPages') - 1) {
          return "Invalid currentPage value [" + attrs.currentPage + "]";
      };
    }
  });

  var PageSelectorView = BBLib.PageSelectorView = Backbone.View.extend({
    tagName: "div",

    windowSize: 5,

    className: "pagination numbers",

    fastForwardings: {
      "first": "<<",
      "last": ">>",
      "prev": "<",
      "next": ">"
    },

    template: _.template("<ul class='page-selector'>"
                + "	<% _.each(pages, function(page) { %>"
                + " 	<li class='page <%= page.cssClass %>'><a href='#'><%= page.label %></a></li>"
                + " <% }) %>"
                + "	</ul>"
                ),

    events: {
      "click .page": "onClickChangePage"
    },

    initialize: function(options) {
      options = options || {}
      this.windowSize = options.windowSize || this.windowSize;
      _.bindAll(this, 'render');
      this.model.on('change:numOfPages change:page', this.render, this)
    },

    render: function() {
      this.$el.empty();
      pages = this.getDisplayPages();
      this.$el.html(this.template(pages));
      return this;
    },

    getDisplayPages: function() {
      if(this.model.get("numOfPages") > 0) {
        var page = this.model.get("page"),
          numOfPages = this.model.get("numOfPages"),
          startPage = Math.max(1, Math.min(page + 1 - parseInt(this.windowSize/2), numOfPages + 1 - this.windowSize)),
          endPage = Math.min(this.model.get("numOfPages")+1, startPage + this.windowSize);

        var result = [
          {label: this.fastForwardings.first, cssClass: page == 0 ? "disabled" : ""},
          {label: this.fastForwardings.prev, cssClass: page == 0 ? "disabled" : ""},
        ];

        var range = _.range(startPage, endPage, 1);
        _.each(range, function(pageNum) {
          result.push({label: pageNum, cssClass: page + 1 === pageNum ? "active" : ""});
        });

        result = result.concat([
            {label: this.fastForwardings.next, cssClass: page + 1 == numOfPages ? "disabled" : ""},
            {label: this.fastForwardings.last, cssClass: page + 1 == numOfPages ? "disabled" : ""},
            ]);

        return result;
      } else {
        return [];
      }
    },

    onClickChangePage: function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var pageStr = $(ev.target).text().trim();
      var pageIndex = this.convertPageIndex(pageStr);
      this.model.set("page", pageIndex, {validate: true});
    },

    convertPageIndex: function(pageStr) {
      var page = 0,
      page = this.model.get("page"),
      numOfPages = this.model.get("numOfPages");

      switch(pageStr){
        case this.fastForwardings.first:
          page = Math.min(0, numOfPages - 1);
          break;
        case this.fastForwardings.prev:
          page = Math.max(0, page - 1);
          break;
        case this.fastForwardings.next:
          page = Math.min(page + 1, numOfPages - 1);
          break;
        case this.fastForwardings.last:
          page = Math.max(0, numOfPages - 1);
          break;
        default:
          page = parseInt(pageStr) - 1;
      }

      return page;
    }

  });

  var GotoPageView = BBLib.GotoPageView= Backbone.View.extend({
    tagName: "div",

    className: "pagination goto",

    events: {
      "blur input": "changePage",
      "keypress input": "changePageOnEnter"
    },

    template: _.template("Goto <input type='text' value='<%= page + 1 %>'/> of <%= numOfPages %>"),

    initialize: function() {
      _.bindAll(this, 'render');
      this.model.on('change', this.render, this);
    },

    render: function() {
      this.$el.empty();
      this.$el.html(this.template(this.model.attributes));
      return this;
    },

    changePage: function(ev) {
      var pageStr = $(ev.target).val();
      var pageIndex = +pageStr - 1; 
      if (_.isNaN(pageIndex) || pageIndex <= 0 || (pageIndex > (this.model.get('numOfPages') - 1))) {
        $(ev.target).val(this.model.get('page') + 1);
      };
      this.model.set("page", pageIndex, {validate: true});
    },

    changePageOnEnter: function(ev) {
      if (ev.keyCode != 13) return;
      this.changePage(ev);
    }
  });

  var PageSizeSelectorView = BBLib.PageSizeSelectorView = Backbone.View.extend({
    tagName: "div",
      className: "pagesize-selector",

      pageSizeOptions: ['All', 10, 20],

      template: _.template(
        "<div class='pagination'>"
        + "<ul class='pagesize-selector'>"
        + " <% _.each(pageSizes, function(size) { %>"
        + " <li class='page-size <%= pageSize==size ? \'active\' : \'\' %>'><a href='#'><%= size %></a></li>"
        + " <% }) %>"
        + "</ul>"
        + "</div>"),

      events: {
        "click .page-size": "onClickChangePageSize"
      },

      initialize: function() {
        _.bindAll(this, 'render');
        this.model.on('change', this.render)
      },

      onClickChangePageSize: function(ev) {
        var pageSizeStr = $(ev.target).text().trim();
        var pageSize = this.convertPageSize(pageSizeStr);

        this.model.set("pageSize", pageSize);
      },

      convertPageSize: function(pageSizeStr) {
        var pageSize = 0;

        if (pageSizeStr == "All") {
          pageSize = 0;
        } else {
          pageSize = parseInt(pageSizeStr);
        };

        return pageSize;
      },

      render: function() {
        this.$el.empty();
        var pageSize = this.model.get("pageSize");

        var pageSizeInfo = {
          pageSizes: this.pageSizeOptions,
          pageSize: pageSize === 0 ? "All" : pageSize
        };

        this.$el.html(this.template(pageSizeInfo));
        return this;
      }
  });


  BBLib.PaginatorView = Backbone.View.extend({
    tagName: "div",

    className: "paginator",

    initialize: function(options) {
      this.pageSelector = new PageSelectorView({model: this.model}); 
      this.gotoPage = new GotoPageView({model: this.model}); 
    },

    render: function() {
      this.$el.empty();
      this.$el.append(this.pageSelector.render().el);
      var gotoEl = this.gotoPage.render().el;
      $(gotoEl).addClass("pull-right");
      this.$el.append(this.gotoPage.render().el);
      return this;
    }
  });

}).call(this);

