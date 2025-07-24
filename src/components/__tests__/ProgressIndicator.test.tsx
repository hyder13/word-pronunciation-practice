import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressIndicator } from '../ProgressIndicator';

describe('ProgressIndicator', () => {
  it('顯示正確的進度文字和百分比', () => {
    render(<ProgressIndicator current={3} total={10} />);
    
    expect(screen.getByText('第 3 個，共 10 個')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('計算正確的百分比', () => {
    render(<ProgressIndicator current={7} total={10} />);
    
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('處理邊界情況 - 0/0', () => {
    render(<ProgressIndicator current={0} total={0} />);
    
    expect(screen.getByText('第 0 個，共 0 個')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('處理邊界情況 - 超出範圍的current值', () => {
    render(<ProgressIndicator current={15} total={10} />);
    
    // Should clamp current to total
    expect(screen.getByText('第 10 個，共 10 個')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('處理邊界情況 - 負數current值', () => {
    render(<ProgressIndicator current={-5} total={10} />);
    
    // Should clamp current to 0
    expect(screen.getByText('第 0 個，共 10 個')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('隱藏文字當showText為false', () => {
    render(<ProgressIndicator current={3} total={10} showText={false} />);
    
    expect(screen.queryByText('第 3 個，共 10 個')).not.toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument(); // percentage still shown
  });

  it('隱藏百分比當showPercentage為false', () => {
    render(<ProgressIndicator current={3} total={10} showPercentage={false} />);
    
    expect(screen.getByText('第 3 個，共 10 個')).toBeInTheDocument();
    expect(screen.queryByText('30%')).not.toBeInTheDocument();
  });

  it('同時隱藏文字和百分比', () => {
    render(
      <ProgressIndicator 
        current={3} 
        total={10} 
        showText={false} 
        showPercentage={false} 
      />
    );
    
    expect(screen.queryByText('第 3 個，共 10 個')).not.toBeInTheDocument();
    expect(screen.queryByText('30%')).not.toBeInTheDocument();
  });

  it('設定正確的ARIA屬性', () => {
    render(<ProgressIndicator current={3} total={10} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '3');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    expect(progressBar).toHaveAttribute('aria-label', '進度：3 / 10 (30%)');
  });

  it('包含螢幕閱讀器文字', () => {
    render(<ProgressIndicator current={3} total={10} />);
    
    expect(screen.getByText('進度：3 / 10，完成 30%')).toBeInTheDocument();
  });

  it('應用自定義className', () => {
    const { container } = render(
      <ProgressIndicator current={3} total={10} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('應用不同的尺寸', () => {
    const { rerender } = render(
      <ProgressIndicator current={3} total={10} size="small" />
    );
    
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('h-1');

    rerender(<ProgressIndicator current={3} total={10} size="medium" />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('h-2');

    rerender(<ProgressIndicator current={3} total={10} size="large" />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('h-3');
  });

  it('應用不同的顏色', () => {
    const { rerender } = render(
      <ProgressIndicator current={3} total={10} color="blue" />
    );
    
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-blue-600');

    rerender(<ProgressIndicator current={3} total={10} color="green" />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-green-600');

    rerender(<ProgressIndicator current={3} total={10} color="purple" />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-purple-600');

    rerender(<ProgressIndicator current={3} total={10} color="red" />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('bg-red-600');
  });

  it('設定正確的進度條寬度', () => {
    render(<ProgressIndicator current={3} total={10} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '30%' });
  });

  it('完成狀態顯示100%', () => {
    render(<ProgressIndicator current={10} total={10} />);
    
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });
});