import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/Skeleton';

describe('Skeleton component', () => {
  it('rend un élément div sans erreur', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).not.toBeNull();
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('applique toujours les classes de base animate-pulse et bg-gray-200', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('animate-pulse');
    expect(el.className).toContain('bg-gray-200');
  });

  it('variante text (défaut) applique h-4 et rounded', () => {
    const { container } = render(<Skeleton variant="text" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('h-4');
    expect(el.className).toContain('rounded');
  });

  it('variante card applique rounded-lg', () => {
    const { container } = render(<Skeleton variant="card" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-lg');
  });

  it('variante avatar applique rounded-full, h-10 et w-10', () => {
    const { container } = render(<Skeleton variant="avatar" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-full');
    expect(el.className).toContain('h-10');
    expect(el.className).toContain('w-10');
  });

  it('variante button applique h-10 et rounded-md', () => {
    const { container } = render(<Skeleton variant="button" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('h-10');
    expect(el.className).toContain('rounded-md');
  });

  it('applique une className personnalisée en plus des classes de base', () => {
    const { container } = render(<Skeleton className="w-full my-4" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('w-full');
    expect(el.className).toContain('my-4');
    // Les classes de base restent présentes
    expect(el.className).toContain('animate-pulse');
  });

  it('applique le style width quand fourni en nombre', () => {
    const { container } = render(<Skeleton width={200} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('200px');
  });

  it('applique le style width quand fourni en string', () => {
    const { container } = render(<Skeleton width="50%" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('50%');
  });

  it('applique le style height quand fourni en nombre', () => {
    const { container } = render(<Skeleton height={100} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('100px');
  });

  it('applique le style height quand fourni en string', () => {
    const { container } = render(<Skeleton height="2rem" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('2rem');
  });

  it('n\'applique pas de style width/height si non fournis', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('');
    expect(el.style.height).toBe('');
  });
});
