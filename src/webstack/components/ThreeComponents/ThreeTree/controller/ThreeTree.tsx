import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import styles from "./ThreeTree.scss";
import useWindow from '@webstack/hooks/window/useWindow';

interface IThreeTree {
  selectedData?: any;
  data: any;
  onClick?: (e: any) => void;
  width?: number;
  height?: number;
  open?: boolean;
  title?: string;
  variant?: 'rectangular' | 'radial';
}

const ThreeTree: React.FC<IThreeTree> = ({ data, selectedData, onClick, title = 'data', open = false, variant = 'rectangular' }) => {
  const FONT_SIZE = 12;
  const TITLE_SIZE = (title.length * FONT_SIZE);
  const NODE_SPACING = 20;
  const colors = {
    content: { enter: "var(--gray-60)", hover: "var(--gray-50)", active: "var(--gray-70)" },
    path: { enter: "var(--blue-10)", hover: "var(--blue-50)", active: "var(--blue-70)" },
    required: { enter: "var(--red-10)", hover: "var(--red-50)", active: "var(--red-10)" },
  };
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [treeData, setTreeData] = useState<any>();
  const [grid, setGrid] = useState({ rows: 0, cols: 0 });
  const [container, setContainer] = useState<{ offsetWidth: number, offsetHeight: number }>({ offsetWidth: 400, offsetHeight: 500 });
  const window = useWindow();

  const handleResize = () => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setContainer({ offsetWidth, offsetHeight });
    }
  };

  useEffect(() => {
    handleResize();
  }, [window?.width, window?.height]);

  useEffect(() => {
    // Convert data to tree structure
    const convertToTree = (obj: any, parentKey: string = title): any => {
      const children = Object.entries(obj).map(([key, value]: [string, any]) => {
        let field: any = { id: parentKey ? `${parentKey}-${key}` : key, name: key, value: null };
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          field.children = convertToTree(value, field.id).children;
        } else if (Array.isArray(value)) {
          field.children = value.map((item, index) => {
            const itemIsDict = typeof item === 'object' && item !== null;
            return itemIsDict ? (
              convertToTree(item, `${field.id}-${index}`)
            ) : (
              { id: `${field.id}-${index}`, name: `${key}-${index}`, value: item }
            );
          });
        } else {
          field.value = value;
        }
        return field;
      });
      return { id: parentKey, name: parentKey, children: children };
    };

    data && setTreeData({ name: title, children: convertToTree(data).children });
  }, [data, open, title]);

  useEffect(() => {
    if (!treeData || !svgRef.current || !container.offsetWidth) return;

    const root: any = d3.hierarchy(treeData, d => d.children || d._children);
    const treeLayout = variant === 'radial'
      ? d3.tree().size([2 * Math.PI, Math.min(container.offsetWidth, container.offsetHeight) / 2])
      : d3.tree().size([container.offsetHeight, container.offsetWidth - TITLE_SIZE]);

    treeLayout(root);
    const svg:any = d3.select(svgRef.current)
      .attr('class', 'd3-svg')
      .attr('viewBox', variant === 'radial'
        ? `-${container.offsetWidth / 2} -${container.offsetHeight / 2} ${container.offsetWidth} ${container.offsetHeight}`
        // : `0 0 auto auto`);
        : `${TITLE_SIZE}px 0 ${container.offsetWidth}px ${container.offsetHeight}px`);

    svg.selectAll('*').remove();

    const gLink = svg.append('g').attr('class', 'd3-links'); 
    const gNode = svg.append('g').attr('class', 'd3-nodes');

    const update = (source: any) => {
      const treeData = treeLayout(root);
      const nodes = treeData.descendants();
      const links = treeData.links();

      const cols = nodes[nodes.length - 1]?.depth + 1;
      const depthCounts = nodes.reduce((acc: any, node: any): any => {
        acc[node.depth] = (acc[node.depth] || 0) + 1;
        return acc;
      }, {});
      const depthValues: number[] = Object.values(depthCounts);
      const rows = Math.max(...depthValues);
      setGrid({ rows, cols });

      if (variant === 'radial') {
        nodes.forEach((d: any) => {
          d.x = d.x * 180 / Math.PI;
          d.y = d.y;
        });
      } else {
        nodes.forEach((d: any) => {
          d.y = d.depth ? d.depth * (container.offsetWidth / cols) - TITLE_SIZE : 0;
        });
      }

      // Adjust node positions to add spacing
      nodes.forEach((d: any) => {
        d.x += NODE_SPACING * d.depth;
      });

      const hasChildren = (d: any) => d?.children || d?._children;

      const handleCircle = (m: any) => {
        m.append('circle')
          .attr('class', 'd3-node--circle');
      };

      const handleText = (m: any) => {
        m.append('foreignObject')
          .attr('y', `${FONT_SIZE * 0.33}px`)
          .attr('x', (d: any) => `${hasChildren(d) ? -String(d.data.name).length * (FONT_SIZE - 2) : FONT_SIZE}px`)
          .attr('id', (d: any) => `marker-${d.data?.id || title}`)
          .attr('class', 'node d3-node')
          .html((d: any) => `
            <div class='d3-node--${Boolean(d.data.children) ? "key" : "name"}'>${d.data.name}</div>
            <div class='d3-node--value'>${d.data.value != undefined ? `${d.data.value}` : ''}</div>
          `);
      };

      const node: any = gNode.selectAll('g.node')
        .data(nodes, (d: any) => d.id || (d.id = ++i));

      const nodeEnter = node.enter().append('g')
        .attr('class', 'node d3-node')
        .attr('transform', (d: any) => variant === 'radial' ? `rotate(${d.x}) translate(${d.y},0)` : `translate(${source.y0},${source.x0})`)
        .style('fill', (d: any) => hasChildren(d) ? colors.content.enter : colors.path.enter)
        .on('mouseover', (event: any, d: any) => {
          const currentNode = event.currentTarget;
          d3.select(currentNode).classed('d3-node--hover', true);
          gLink.selectAll(`.link-${d.data.id}`).style('stroke', colors.path.hover);
        })
        .on('mouseout', (event: any, d: any) => {
          const currentNode = event.currentTarget;
          d3.select(currentNode).classed('d3-node--hover', false);
          gLink.selectAll(`.link-${d.data.id}`).style('stroke', null);
        })
        .on('click', (event: any, d: any) => {
          console.log({ data: d.data });
          onClick?.(d.data);

          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update(d);
        });

      handleCircle(nodeEnter);
      handleText(nodeEnter);

      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate.transition()
        .duration(200)
        .attr('transform', (d: any) => variant === 'radial' ? `rotate(${d.x - 90}) translate(${d.y},0)` : `translate(${d.y},${d.x})`);


      const nodeExit = node.exit().transition()
        .duration(200)
        .attr('transform', (d: any) => `translate(${source.y},${source.x})`)
        .remove();

      nodeExit.select('circle')
        .attr('r', 1e-6);

      nodeExit.select('text')
        .style('fill-opacity', 1e-6);

      const link: any = gLink.selectAll('path.link')
        .data(links, (d: any) => d.target.id);

      const linkEnter = link.enter().insert('path', 'g')
        .attr('id', (d: any) => `link-${d.target.data.id}`)
        .attr('class', 'link')
        .attr('d', (d: any) => {
          const o = { x: source.x0, y: source.y0 };
          return variant === 'radial' ? radialDiagonal(o, o) : diagonal(o, o);
        });

      const linkExit = link.exit().transition()
        .duration(200)
        .attr('d', (d: any) => {
          const o = { x: source.x, y: source.y };
          return variant === 'radial' ? radialDiagonal(o, o) : diagonal(o, o);
        })
        .remove();

      const linkUpdate = linkEnter.merge(link);

      linkUpdate.transition()
        .duration(200)
        .attr('d', (d: any) => variant === 'radial' ? radialDiagonal(d.source, d.target) : diagonal(d.source, d.target));

      function radialDiagonal(s: any, d: any) {
        const s_x = s.y * Math.cos((s.x - 90) / 180 * Math.PI);
        const s_y = s.y * Math.sin((s.x - 90) / 180 * Math.PI);
        const d_x = d.y * Math.cos((d.x - 90) / 180 * Math.PI);
        const d_y = d.y * Math.sin((d.x - 90) / 180 * Math.PI);
        const path = `M ${s_x},${s_y}
          C ${(s_x + d_x) / 2},${s_y},
            ${(s_x + d_x) / 2},${d_y},
            ${d_x},${d_y}`;
        return path;
      }

      function diagonal(s: any, d: any) {
        const path = `M ${s.y} ${s.x}
          C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`;
        return path;
      }

      nodes.forEach((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // Adjust SVG size to fit the content

    };

    let i = 0;
    root.x0 = container.offsetHeight / 2;
    root.y0 = 0;
    update(root);
    // const bbox = svg.select('.d3-nodes').node().getBBox();
    // // const bbox = svg.select('.d3-nodes').node().getBoundingClientRect();
    // const refHeight = svgRef?.current
    // console.log(1,{bbox,containerHeight: refHeight})
    // if(svgRef?.current && svgRef?.current){
    //             //   const bbox = svg.select('.d3-nodes').node().getBoundingClientRect();
    //               const bbox = svg.select('.d3-nodes').node().getBBox();
    //   console.log(2,{bbox,containerHeight: refHeight, trythis:svgRef})
    // //   svg.attr('width', bbox.width + bbox.x * 2);
    // //   svg.attr('height', bbox.height + bbox.y * 2);
    // }
  }, [container, variant, data]);

  return (
    <>
      <style jsx>{styles}</style>
      <div className='three-tree' ref={containerRef}>
        <svg ref={svgRef}></svg>
      </div>
    </>
  );
};

export default ThreeTree;
