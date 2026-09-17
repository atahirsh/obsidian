import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useStore } from '../store';
import { extractLinks } from '../utils/markdown';
import { GraphNode, GraphLink } from '../types';
import { X } from 'lucide-react';

export default function GraphView() {
  const { files, setGraphViewOpen, setCurrentFile, openTab } = useStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleClose = () => setGraphViewOpen(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Build graph data
    const fileNodes = files.filter((f) => f.type === 'file');
    const nodes: GraphNode[] = fileNodes.map((file) => ({
      id: file.id,
      name: file.name,
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
      links: extractLinks(file.content || ''),
      tags: file.tags || [],
    }));

    const links: GraphLink[] = [];
    for (const node of nodes) {
      for (const linkName of node.links) {
        const target = nodes.find((n) => n.name === linkName);
        if (target) {
          links.push({ source: node.id, target: target.id });
        }
      }
    }

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(links as any)
          .id((d: any) => d.id)
          .distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create zoom
    const g = svg.append('g');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#4a4d6e')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5);

    // Create nodes
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3
          .drag<any, any>()
          .on('start', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.x = event.x;
            d.y = event.y;
          })
          .on('drag', (event: any, d: any) => {
            d.x = event.x;
            d.y = event.y;
          })
          .on('end', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
          }) as any
      );

    // Node circles
    node
      .append('circle')
      .attr('r', (d) => Math.max(6, Math.min(12, d.links.length * 2 + 4)))
      .attr('fill', (d) => {
        if (d.links.length > 3) return '#a78bfa';
        if (d.links.length > 1) return '#818cf8';
        return '#6366f1';
      })
      .attr('stroke', '#1e1e2e')
      .attr('stroke-width', 2);

    // Node labels
    node
      .append('text')
      .text((d) => d.name)
      .attr('x', 14)
      .attr('y', 4)
      .attr('fill', '#e2e8f0')
      .attr('font-size', '11px')
      .attr('font-family', 'sans-serif');

    // Click handler
    node.on('click', (event, d) => {
      const file = files.find((f) => f.id === d.id);
      if (file) {
        setCurrentFile(file.id);
        openTab(file.id, file.name);
      }
    });

    // Hover effects
    node
      .on('mouseover', function () {
        d3.select(this).select('circle').attr('r', function () {
          const d = d3.select(this).datum() as GraphNode;
          return Math.max(8, Math.min(16, d.links.length * 2 + 6));
        });
      })
      .on('mouseout', function () {
        d3.select(this).select('circle').attr('r', function () {
          const d = d3.select(this).datum() as GraphNode;
          return Math.max(6, Math.min(12, d.links.length * 2 + 4));
        });
      });

    // Update positions
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [files, dimensions, setCurrentFile, openTab]);

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1e2e]/95 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2d3e]">
        <h2 className="text-lg font-semibold text-white">Graph View</h2>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-[#2a2d3e] rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>
      <div ref={containerRef} className="flex-1 relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
        <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-[#1e1e2e]/80 px-3 py-2 rounded-lg">
          <p>Scroll to zoom • Drag to pan • Click nodes to open files</p>
        </div>
      </div>
    </div>
  );
}
