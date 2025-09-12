import React from 'react';
import styled from 'styled-components';
import { Highlight } from '../../types';

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
`;

const HighlightBox = styled.div<{ 
  highlight: Highlight;
  scale: number;
}>`
  position: absolute;
  background-color: ${({ highlight }) => highlight.color};
  opacity: 0.3;
  left: ${({ highlight, scale }) => highlight.boundingBox.x * scale}px;
  top: ${({ highlight, scale }) => highlight.boundingBox.y * scale}px;
  width: ${({ highlight, scale }) => highlight.boundingBox.width * scale}px;
  height: ${({ highlight, scale }) => highlight.boundingBox.height * scale}px;
  cursor: pointer;
  pointer-events: auto;
  transition: opacity 0.2s ease;
  border-radius: 2px;
  
  &:hover {
    opacity: 0.5;
    box-shadow: 0 0 0 2px ${({ highlight }) => highlight.color};
  }
`;

const HighlightTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-primary);
  box-shadow: var(--shadow);
  white-space: nowrap;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  
  ${HighlightBox}:hover & {
    opacity: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--border);
  }
`;

interface HighlightOverlayProps {
  highlights: Highlight[];
  scale: number;
  onHighlightClick: (uuid: string) => void;
}

const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  highlights,
  scale,
  onHighlightClick
}) => {
  return (
    <OverlayContainer>
      {highlights.map((highlight) => (
        <HighlightBox
          key={highlight.uuid}
          highlight={highlight}
          scale={scale}
          onClick={() => onHighlightClick(highlight.uuid)}
          title={`${highlight.text}${highlight.note ? ` - ${highlight.note}` : ''}`}
        >
          <HighlightTooltip>
            <div style={{ fontWeight: 'bold' }}>"{highlight.text.substring(0, 50)}..."</div>
            {highlight.note && <div>{highlight.note}</div>}
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              Click to delete
            </div>
          </HighlightTooltip>
        </HighlightBox>
      ))}
    </OverlayContainer>
  );
};

export default HighlightOverlay;
