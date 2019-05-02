import React from "react";
import PropTypes from 'prop-types';
import joint from "jointjs/index";
import { DagNode } from "./definitions";

const LINK_STROKE_WIDTH = 1;
const LINK_HIGHLIGHTED_STROKE_WIDTH = 2;

class SimpleDagEditor extends React.Component {
  constructor(props) {
    super(props);

    this.paperContainer = React.createRef();
  }

  buildDag = (nodes, edges) => {
    var elements = nodes.map(n => new DagNode({ id: n.id }).setText(n.title));
    //var elements = nodes.map(n => new DagOutPort({ id: n.id }));

    var links = edges.map(e =>
      new joint.shapes.standard.Link({
        source: { id: e.from },
        target: { id: e.to },
        connector: { name: "rounded" },
        attrs: {
          line: {
            stroke: "black",
            strokeWidth: LINK_STROKE_WIDTH
          }
        }
      }).router("metro", {
        startDirections: ["bottom"],
        endDirections: ["top"]
      })
    );
    return elements.concat(links);
  };

  layout = dag => {
    var self = this;

    var paper = new joint.dia.Paper({
      el: this.paperContainer.current,
      width: 1000,
      height: 600,
      gridSize: 10,
      model: new joint.dia.Graph(),
      linkPinning: false,
      markAvailable: true,
      multiLinks: false,
      snapLinks: true,
      validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
        // Prevent linking from output ports to input ports within one element.
        if (cellViewS === cellViewT) return false;
        // Prevent linking to output ports.
        if (magnetT && magnetT.getAttribute("port-group") === "out") return false;
        // Only other elements should be nodes
        else if (cellViewT.model.isElement()) return true;
      },
      defaultLink: function (elementView, magnet) {
        return new joint.shapes.standard.Link({
          connector: { name: "rounded" },
          attrs: {
            line: {
              stroke: "black",
              strokeWidth: LINK_STROKE_WIDTH
            }
          }
        }).router("metro", {
          startDirections: ["bottom"],
          endDirections: ["top"]
        });
      }
    });

    joint.layout.DirectedGraph.layout(dag, {
      ranker: "tight-tree",
      rankDir: "TB",
      align: "UL",
      rankSep: 100,
      edgeSep: 100,
      nodeSep: 100
    });

    // The graph could be empty at the beginning to avoid cells rendering
    // and their subsequent update when elements are translated
    if (paper.model.getCells().length === 0) {
      paper.model.resetCells(dag);
    }

    paper.fitToContent({
      padding: 10,
      allowNewOrigin: "any"
    });

    // TODO - panning
    // paper.on("blank:pointerdown", function(cellView) {
    //   self.clearLinkSelection(paper);
    // });

    /// Events //////////////////////////////////////////////////////////////////////////////

    paper.model.on("change:position", function (cell) {
      var allCells = paper.model.getCells();

      // has an obstacle been moved? Then reroute the link.
      if (allCells.indexOf(cell) > -1) {
        console.log("updating...");

        allCells.forEach(link => {
          paper.findViewByModel(link).update();
        });
      }
    });

    paper.on("blank:pointerdblclick", function (cellView) {
      self.clearLinkSelection(paper);
    });

    paper.on("cell:pointerdblclick", function (cellView) {
      console.log(cellView.model.id);
    });

    paper.on("link:mouseenter", function (linkView) {
      linkView.showTools();
    });

    paper.on("link:mouseleave", function (linkView) { });

    paper.on("link:pointerdown", function (linkView) {
      self.clearLinkSelection(paper);
      self.selectLink(linkView, paper);
      linkView.startArrowheadMove("target");
    });
    //////////////////////////////////////////////////////////////////////////////////////////
  };

  clearLinkSelection = paper => {
    var links = paper.model.getLinks();

    links.forEach(l => {
      var linkView = l.findView(paper);
      linkView.model.attr("line/stroke", "black");
      linkView.model.attr("line/strokeWidth", LINK_STROKE_WIDTH);
      linkView.model.toBack();
      linkView.removeTools();
    });
  };

  selectLink = linkView => {
    linkView.model.attr("line/stroke", "red");
    linkView.model.attr("line/strokeWidth", LINK_HIGHLIGHTED_STROKE_WIDTH);
    linkView.model.toFront();

    // tools
    var verticesTool = new joint.linkTools.Vertices({
      vertexAdding: false
    });
    var targetArrowheadTool = new joint.linkTools.TargetArrowhead();

    var removeButton = new joint.linkTools.Remove({
      focusOpacity: 0.5,
      rotate: false,
      distance: 0,
      offset: 0
    });

    linkView.addTools(
      new joint.dia.ToolsView({
        tools: [
          //
          verticesTool,
          targetArrowheadTool,
          removeButton
        ]
      })
    );
  };
  componentWillMount() { }

  componentDidMount() {

    let dag = this.buildDag(this.props.nodes, this.props.edges);

    this.layout(dag);
  }

  render() {
    return (
      <div id="paper" className="paper" ref={this.paperContainer} />

    );
  }
}

SimpleDagEditor.propTypes = {
  nodes:  PropTypes.array,
  edges:  PropTypes.array
};

export default SimpleDagEditor

