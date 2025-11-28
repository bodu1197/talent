import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BACKGROUND_TEMPLATES,
  createGradientBackground,
  createTemplatePreview,
  generateThumbnailWithText,
  GradientTemplate,
  TextOverlayOptions,
} from '@/lib/template-generator';

// Mock document and canvas
const mockContext = {
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  fillStyle: '',
  font: '',
  textAlign: '',
  textBaseline: '',
  shadowBlur: 0,
  shadowColor: '',
};

const mockCanvas = {
  width: 652,
  height: 488,
  getContext: vi.fn(() => mockContext),
  toDataURL: vi.fn(() => 'data:image/jpeg;base64,mock'),
  toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
    callback(new Blob(['mock'], { type: 'image/jpeg' }));
  }),
};

vi.stubGlobal('document', {
  createElement: vi.fn(() => mockCanvas),
});

describe('template-generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvas.getContext.mockReturnValue(mockContext);
  });

  describe('BACKGROUND_TEMPLATES', () => {
    it('should have 20 templates', () => {
      expect(BACKGROUND_TEMPLATES.length).toBe(20);
    });

    it('should have unique ids', () => {
      const ids = BACKGROUND_TEMPLATES.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have required properties for each template', () => {
      for (const template of BACKGROUND_TEMPLATES) {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.type).toMatch(/^(linear|radial)$/);
        expect(template.colors).toBeDefined();
        expect(template.colors.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should have linear templates with angles', () => {
      const linearTemplates = BACKGROUND_TEMPLATES.filter(t => t.type === 'linear');
      expect(linearTemplates.length).toBeGreaterThan(0);

      for (const template of linearTemplates) {
        expect(template.angle).toBeDefined();
        expect(typeof template.angle).toBe('number');
      }
    });

    it('should have radial templates', () => {
      const radialTemplates = BACKGROUND_TEMPLATES.filter(t => t.type === 'radial');
      expect(radialTemplates.length).toBeGreaterThan(0);
    });

    it('should have valid hex color codes', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

      for (const template of BACKGROUND_TEMPLATES) {
        for (const color of template.colors) {
          expect(color).toMatch(hexColorRegex);
        }
      }
    });
  });

  describe('createGradientBackground', () => {
    it('should create canvas with default dimensions', () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 90,
      };

      const canvas = createGradientBackground(template);

      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(canvas.width).toBe(652);
      expect(canvas.height).toBe(488);
    });

    it('should create canvas with custom dimensions', () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 90,
      };

      const canvas = createGradientBackground(template, 800, 600);

      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });

    it('should create linear gradient for linear type', () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 135,
      };

      createGradientBackground(template);

      expect(mockContext.createLinearGradient).toHaveBeenCalled();
    });

    it('should create radial gradient for radial type', () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'radial',
        colors: ['#000000', '#ffffff'],
      };

      createGradientBackground(template);

      expect(mockContext.createRadialGradient).toHaveBeenCalled();
    });

    it('should fill the canvas with gradient', () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 90,
      };

      createGradientBackground(template);

      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 652, 488);
    });
  });

  describe('createTemplatePreview', () => {
    it('should create preview with default dimensions', () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 90,
      };

      const dataUrl = createTemplatePreview(template);

      expect(dataUrl).toBe('data:image/jpeg;base64,mock');
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    });

    it('should create preview with custom dimensions', () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 90,
      };

      createTemplatePreview(template, 100, 75);

      expect(mockCanvas.width).toBe(100);
      expect(mockCanvas.height).toBe(75);
    });
  });

  describe('generateThumbnailWithText', () => {
    it('should generate thumbnail with text overlay', async () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 90,
      };

      const textOptions: TextOverlayOptions = {
        text: 'Test Text',
        x: 0.5,
        y: 0.5,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 'bold',
      };

      const blob = await generateThumbnailWithText(template, textOptions);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
    });

    it('should apply text shadow when specified', async () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 90,
      };

      const textOptions: TextOverlayOptions = {
        text: 'Shadow Text',
        x: 0.5,
        y: 0.5,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 'bold',
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.5)',
      };

      await generateThumbnailWithText(template, textOptions);

      expect(mockContext.shadowBlur).toBe(10);
      expect(mockContext.shadowColor).toBe('rgba(0,0,0,0.5)');
    });

    it('should set font properties correctly', async () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 90,
      };

      const textOptions: TextOverlayOptions = {
        text: 'Font Test',
        x: 0.5,
        y: 0.5,
        fontSize: 32,
        fontFamily: 'Noto Sans KR',
        color: '#ff0000',
        textAlign: 'left',
        fontWeight: '700',
      };

      await generateThumbnailWithText(template, textOptions);

      expect(mockContext.font).toBe('700 32px Noto Sans KR');
      expect(mockContext.fillStyle).toBe('#ff0000');
      expect(mockContext.textAlign).toBe('left');
    });

    it('should handle custom dimensions', async () => {
      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 90,
      };

      const textOptions: TextOverlayOptions = {
        text: 'Custom Size',
        x: 0.5,
        y: 0.5,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 'normal',
      };

      await generateThumbnailWithText(template, textOptions, 1280, 720);

      expect(mockCanvas.width).toBe(1280);
      expect(mockCanvas.height).toBe(720);
    });

    it('should reject when blob creation fails', async () => {
      mockCanvas.toBlob.mockImplementationOnce((callback: (blob: Blob | null) => void) => {
        callback(null);
      });

      const template: GradientTemplate = {
        id: 'test',
        name: 'Test',
        type: 'linear',
        colors: ['#000000', '#ffffff'],
        angle: 90,
      };

      const textOptions: TextOverlayOptions = {
        text: 'Fail Test',
        x: 0.5,
        y: 0.5,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 'normal',
      };

      await expect(generateThumbnailWithText(template, textOptions)).rejects.toThrow('Failed to create blob');
    });
  });
});
