import React, { useState } from 'react';
import styled from 'styled-components';
import { Palette, MessageSquare, Trash2, Plus, Search } from 'lucide-react';
import { Button, Card } from '../../styles/GlobalStyle';
import { Highlight, BoundingBox } from '../../types';

const ToolsContainer = styled.div`
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ColorPalette = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
`;

const ColorButton = styled.button<{ color: string; isSelected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid ${({ isSelected }) => isSelected ? 'var(--primary-color)' : 'var(--border)'};
  background: ${({ color }) => color};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: var(--primary-color);
  }
`;

const SelectionCard = styled(Card)<{ hasSelection: boolean }>`
  padding: 1rem;
  background: ${({ hasSelection }) => hasSelection ? 'rgba(37, 99, 235, 0.05)' : 'var(--background)'};
  border: ${({ hasSelection }) => hasSelection ? '2px solid var(--primary-color)' : '1px solid var(--border)'};
`;

const SelectedText = styled.div`
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: var(--surface);
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
  font-style: italic;
  max-height: 100px;
  overflow-y: auto;
`;

const NoteInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: 0.75rem;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const HighlightsList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HighlightItem = styled(Card)`
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid var(--primary-color);
  
  &:hover {
    background: var(--background);
    transform: translateX(2px);
  }
`;

const HighlightText = styled.div`
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const HighlightNote = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const HighlightMeta = styled.div`
  font-size: 0.7rem;
  color: var(--text-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 3px;
  
  &:hover {
    background: var(--error-color);
    color: white;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.875rem;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

interface HighlightToolsProps {
  highlights: Highlight[];
  selectedText: string;
  selectionBounds: BoundingBox | null;
  highlightColor: string;
  onColorChange: (color: string) => void;
  onAddHighlight: (note?: string) => void;
  onDeleteHighlight: (uuid: string) => void;
  onClearSelection: () => void;
}

const HIGHLIGHT_COLORS = [
  '#ffff00', 
  '#ff6b6b', 
  '#4ecdc4', 
  '#45b7d1', 
  '#96ceb4', 
  '#feca57',
  '#ff9ff3', 
  '#a55eea'  
];

const HighlightTools: React.FC<HighlightToolsProps> = ({
  highlights,
  selectedText,
  selectionBounds,
  highlightColor,
  onColorChange,
  onAddHighlight,
  onDeleteHighlight,
  onClearSelection
}) => {
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddHighlight = () => {
    onAddHighlight(note);
    setNote('');
  };

  const filteredHighlights = highlights.filter(highlight =>
    highlight.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    highlight.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ToolsContainer>
      <Section>
        <SectionTitle>
          <Palette size={16} />
          Highlight Color
        </SectionTitle>
        <ColorPalette>
          {HIGHLIGHT_COLORS.map((color) => (
            <ColorButton
              key={color}
              color={color}
              isSelected={color === highlightColor}
              onClick={() => onColorChange(color)}
              title={`Select ${color} color`}
            />
          ))}
        </ColorPalette>
      </Section>

      <Section>
        <SectionTitle>
          <MessageSquare size={16} />
          Text Selection
        </SectionTitle>
        
        <SelectionCard hasSelection={!!selectedText}>
          {selectedText ? (
            <>
              <SelectedText>"{selectedText}"</SelectedText>
              
              <NoteInput
                placeholder="Add a note (optional)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button onClick={handleAddHighlight} style={{ flex: 1 }}>
                  <Plus size={14} style={{ marginRight: '0.25rem' }} />
                  Add Highlight
                </Button>
                <Button variant="secondary" onClick={onClearSelection}>
                  Clear
                </Button>
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--text-secondary)', 
              fontSize: '0.875rem' 
            }}>
              Select text in the PDF to create highlights
            </div>
          )}
        </SelectionCard>
      </Section>

      <Section style={{ flex: 1, overflow: 'hidden' }}>
        <SectionTitle>
          <Search size={16} />
          All Highlights ({highlights.length})
        </SectionTitle>
        
        <SearchInput
          type="text"
          placeholder="Search highlights..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <HighlightsList>
          {filteredHighlights.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--text-secondary)', 
              fontSize: '0.875rem',
              padding: '2rem 1rem'
            }}>
              {searchQuery ? 'No highlights found' : 'No highlights yet'}
            </div>
          ) : (
            filteredHighlights.map((highlight) => (
              <HighlightItem key={highlight.uuid}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '3px',
                      backgroundColor: highlight.color,
                      borderRadius: '2px',
                      marginBottom: '0.5rem'
                    }}
                  />
                </div>
                
                <HighlightText>
                  "{highlight.text.substring(0, 100)}{highlight.text.length > 100 ? '...' : ''}"
                </HighlightText>
                
                {highlight.note && (
                  <HighlightNote>{highlight.note}</HighlightNote>
                )}
                
                <HighlightMeta>
                  <span>Page {highlight.pageNumber}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{formatDate(highlight.createdAt)}</span>
                    <DeleteButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHighlight(highlight.uuid);
                      }}
                      title="Delete highlight"
                    >
                      <Trash2 size={12} />
                    </DeleteButton>
                  </div>
                </HighlightMeta>
              </HighlightItem>
            ))
          )}
        </HighlightsList>
      </Section>
    </ToolsContainer>
  );
};

export default HighlightTools;
