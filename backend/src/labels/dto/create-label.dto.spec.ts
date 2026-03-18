import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateLabelDto } from './create-label.dto';

describe('CreateLabelDto', () => {
  function toDto(data: Record<string, any>): CreateLabelDto {
    return plainToInstance(CreateLabelDto, data);
  }

  it('should pass with valid hex color', async () => {
    const dto = toDto({ color: '#4A90D9' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with color and name', async () => {
    const dto = toDto({ color: '#FF0000', name: 'Red' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail with invalid hex color', async () => {
    const dto = toDto({ color: 'red' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'color')).toBe(true);
  });

  it('should fail with 3-digit hex', async () => {
    const dto = toDto({ color: '#F00' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'color')).toBe(true);
  });

  it('should fail when color is missing', async () => {
    const dto = toDto({});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'color')).toBe(true);
  });

  it('should accept lowercase hex', async () => {
    const dto = toDto({ color: '#aabbcc' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
