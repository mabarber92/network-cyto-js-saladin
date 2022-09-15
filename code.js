// Set up global configurations - eventually push out to a config file
var reducedOpacity = '0.3';



/* global Promise, fetch, window, cytoscape, document, tippy, _ */

Promise.all([
  fetch('cy-style.json')
    .then(function(res) {
      return res.json();
    }),
  fetch('data2.json')
    .then(function(res) {
      return res.json();
    })
])
  .then(function(dataArray) {
    var h = function(tag, attrs, children){
      var el = document.createElement(tag);

      Object.keys(attrs).forEach(function(key){
        var val = attrs[key];

        el.setAttribute(key, val);
      });

      children.forEach(function(child){
        el.appendChild(child);
      });

      return el;
    };

    var t = function(text){
      var el = document.createTextNode(text);

      return el;
    };

    var $ = document.querySelector.bind(document);

    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),
      style: dataArray[0],
      elements: dataArray[1],
      layout: { name: 'random' }
    });

    var params = {
      name: 'cola',
      nodeSpacing: 5,
      edgeLengthVal: 45,
      animate: true,
      randomize: false,
      maxSimulationTime: 1500
    };
    var layout = makeLayout();

    layout.run();

    // var $btnParam = h('div', {
    //   'class': 'param'
    // }, []);

    // var $config = $('#config');

    // $config.appendChild( $btnParam );

    var sliders = [
      {
        label: 'Edge length',
        param: 'edgeLengthVal',
        min: 1,
        max: 200
      },

      {
        label: 'Node spacing',
        param: 'nodeSpacing',
        min: 1,
        max: 50
      }
    ];

    // var buttons = [
    //   {
    //     label: h('span', { 'class': 'fa fa-random' }, []),
    //     layoutOpts: {
    //       randomize: true,
    //       flow: null
    //     }
    //   },

    //   {
    //     label: h('span', { 'class': 'fa fa-long-arrow-down' }, []),
    //     layoutOpts: {
    //       flow: { axis: 'y', minSeparation: 30 }
    //     }
    //   }
    // ];

    sliders.forEach( makeSlider );

    // buttons.forEach( makeButton );

    function makeLayout( opts ){
      params.randomize = false;
      params.edgeLength = function(e){ return params.edgeLengthVal / e.data('weight'); };

      for( var i in opts ){
        params[i] = opts[i];
      }

      return cy.layout( params );
    }

    function makeSlider( opts ){
      var $input = h('input', {
        id: 'slider-'+opts.param,
        type: 'range',
        min: opts.min,
        max: opts.max,
        step: 1,
        value: params[ opts.param ],
        'class': 'slider'
      }, []);

      // var $param = h('div', { 'class': 'param' }, []);

      // var $label = h('label', { 'class': 'label label-default', for: 'slider-'+opts.param }, [ t(opts.label) ]);

      // $param.appendChild( $label );
      // $param.appendChild( $input );

      // $config.appendChild( $param );

      // var update = _.throttle(function(){
      //   params[ opts.param ] = $input.value;

      //   layout.stop();
      //   layout = makeLayout();
      //   layout.run();
      // }, 1000/30);

      // $input.addEventListener('input', update);
      // $input.addEventListener('change', update);
    }

    // function makeButton( opts ){
    //   var $button = h('button', { 'class': 'btn btn-default' }, [ opts.label ]);

    //   $btnParam.appendChild( $button );

    //   $button.addEventListener('click', function(){
    //     layout.stop();

    //     if( opts.fn ){ opts.fn(); }

    //     layout = makeLayout( opts.layoutOpts );
    //     layout.run();
    //   });
    // }

    var makeTippy = function(node, html){
      return tippy( node.popperRef(), {
        html: html,
        trigger: 'manual',
        arrow: true,
        placement: 'bottom',
        hideOnClick: false,
        interactive: true
      } ).tooltips[0];
    };

    var hideTippy = function(node){
      var tippy = node.data('tippy');

      if(tippy != null){
        tippy.hide();
      }
    };

    var hideAllTippies = function(){
      cy.nodes().forEach(hideTippy);
    };

    cy.on('tap', function(e){
      if(e.target === cy){
        hideAllTippies();
      }
    });

    cy.on('tap', 'edge', function(e){
      hideAllTippies();
    });

    cy.on('zoom pan', function(e){
      hideAllTippies();
    });

    cy.nodes().forEach(function(n){
      var g = n.data('id');

      var $links = [
        {
          name: g,
          url: ''
        },
        
      ].map(function( link ){
        return h('a', { target: '_blank', href: link.url, 'class': 'tip-link' }, [ t(link.name) ]);
      });

      var tippy = makeTippy(n, h('div', {}, $links));

      n.data('tippy', tippy);

      n.on('select', function(e){
        tippy.show();

        cy.nodes().not(n).forEach(hideTippy);
        
        document.getElementById('databox').innerHTML= 'Select an edge to get data';
        // let new_layout = cy.layout({
        //   name:'breadthfirst',
          
        //   roots: n
        // });
        // new_layout.run()
        // cy.animate({
        //   fit: {
        //     eles: n.connectedEdges().connectedNodes(),
        //     padding: 20
        //   }
        // })
        panNode(n)
      });
      n.on('unselect', function(e){
        cy.animate({
          fit: {
            eles: cy.nodes(),
            padding: 20
          }
        });
        cy.nodes().style('background-opacity', '1');
        cy.edges().style('line-opacity', '1');
      })
    });

    cy.edges().forEach(function(ed){
      var d = ed.data('city');
      var s = ed.data('source');
      var ta = ed.data('target');

      var $info = 
        {
          source: s,
          target: ta,
          dat: d
        }
        
      

      

    ed.on('select', function(e){
      document.getElementById('databox').innerHTML = '';
      var sourcebox = document.createElement('div');
      sourcebox.setAttribute('id', 'sourcebox');
      document.getElementById('databox').appendChild(sourcebox);
      var targetbox = document.createElement('div');
      targetbox.setAttribute('id', 'targetbox');
      document.getElementById('databox').appendChild(targetbox);
      var infobox = document.createElement('div');
      infobox.setAttribute('id', 'infobox');
      document.getElementById('databox').appendChild(infobox);
      document.getElementById('sourcebox').appendChild(document.createTextNode(`Source: ${$info.source}`));
      document.getElementById('targetbox').appendChild(document.createTextNode(`Target: ${$info.target}`));
      document.getElementById('infobox').appendChild(document.createTextNode(`Info: ${$info.dat}`));
      
      });
    // cy.nodes().on('click', function(e){
    //   document.getElementById('databox').innerHTML= 'Select an edge to get data'
    // });
    ed.on('unselect', function(e){
      document.getElementById('databox').innerHTML= 'Select an edge to get data'
    });
    });

    $('#config-toggle').addEventListener('click', function(){
      $('body').classList.toggle('config-closed');

      cy.resize();
    });

  });

  function centreLayout(n){
    var layoutFix = document.querySelector("#layout-fix:checked") !== null;
    console.log(layoutFix);
    writeEdges(n);
    if (layoutFix === true){
      cy.nodes().style('background-opacity', reducedOpacity);
      cy.edges().style('line-opacity', reducedOpacity);
      n.connectedEdges().connectedNodes().style('background-opacity', '1');
      n.connectedEdges().style('line-opacity', '1');
      return true;
    }
    else if (n.connectedEdges().length < 4){
    let new_layout = cy.layout({
      name:'breadthfirst',
      circle: false,
      roots: n,
      animate: true,
      animationDuration: 500
      
    });
    cy.nodes().style('background-opacity', '1');
    cy.edges().style('line-opacity', '1');
    n.connectedEdges().connectedNodes().style('background-opacity', '1');
    n.connectedEdges().style('line-opacity', '1');
    console.log(n.connectedEdges().length)
    return new_layout.run();
    } else {
      let new_layout = cy.layout({
        name:'breadthfirst',
        circle: true,
        roots: n,
        animate: true,
        animationDuration: 500
    });

    cy.nodes().style('background-opacity', reducedOpacity);
    cy.edges().style('line-opacity', reducedOpacity);
    n.connectedEdges().connectedNodes().style('background-opacity', '1');
    n.connectedEdges().style('line-opacity', '1');
    console.log(n.connectedEdges().length)
    return new_layout.run();
  };

  }; 

 async function panNode(n) {
    const response = await(centreLayout(n))
    if (!response.ok){
      cy.animate({
        fit: {
          eles: n.connectedEdges().connectedNodes(),
          padding: 40
         }})
    
      }
    }; 

function writeEdges(n) {
  // get the node and write it to the inner div
  const nodeName = n.data('id');
  const innerDiv = document.createElement("div");
  innerDiv.innerHTML = `<h2>Selected node:</h2> <h2 align='right'>${nodeName}</h2> <h2>Direct connections:</h2>`;
  
  // get the closest edges and map them into divs - 
  // eventually turn ids into urls that can be used as a select event

  const targetsDiv = document.createElement('div');
  const Edges = n.connectedEdges()
  Edges.forEach(function (edge) {
    const edgeDiv = document.createElement('div');
    const targetNodeId = edge.connectedNodes().data('id') 
    if (edge.data('source') === nodeName){
    edgeDiv.innerHTML = `<a href = 'javascript: selectNode("${edge.data('target')}", "${nodeName}")'> <h3 align='right'>${edge.data('target')}</h3></a> 
    <p>${edge.data('city')}</p>`}
    else {edgeDiv.innerHTML = `<a href = 'javascript: selectNode("${edge.data('source')}", "${nodeName}")'> <h3 align='right'>${edge.data('source')}</h3></a> 
    <p>${edge.data('city')}</p>`};
    targetsDiv.appendChild(edgeDiv);
  })
  
  console.log(targetsDiv)
  innerDiv.appendChild(targetsDiv);
  console.log(innerDiv)

  // Clear the innerHTML and write out the new content div
  document.getElementById('databox').innerHTML = '';
  
  document.getElementById('databox').appendChild(innerDiv);
};

function selectNode(nodeId, currentNode) {
 var selector = `#${nodeId}`
 console.log(selector)
 cy.$(`node[id = "${currentNode}"]`).unselect()
 cy.$(`node[id = "${nodeId}"]`).select()
 };