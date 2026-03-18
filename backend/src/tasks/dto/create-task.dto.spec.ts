import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTaskDto } from './create-task.dto';

describe('CreateTaskDto', () => {
  function toDto(data: Record<string, any>): CreateTaskDto {
    return plainToInstance(CreateTaskDto, data);
  }

  it('should pass with valid data', async () => {
    const dto = toDto({ title: 'Test task', date: '2026-03-16' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with valid labelIds', async () => {
    const dto = toDto({
      title: 'Test',
      date: '2026-03-16',
      labelIds: ['11111111-1111-4111-a111-111111111111'],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when title is empty', async () => {
    const dto = toDto({ title: '', date: '2026-03-16' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('should fail when title exceeds 200 chars', async () => {
    const dto = toDto({ title: 'a'.repeat(201), date: '2026-03-16' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('should fail with invalid date format', async () => {
    const dto = toDto({ title: 'Test', date: 'not-a-date' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'date')).toBe(true);
  });

  it('should fail when title is missing', async () => {
    const dto = toDto({ date: '2026-03-16' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('should fail with invalid UUID in labelIds', async () => {
    const dto = toDto({
      title: 'Test',
      date: '2026-03-16',
      labelIds: ['not-a-uuid'],
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'labelIds')).toBe(true);
  });
});
