import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';

export const CurrentUser = createParamDecorator<
  keyof UserEntity | undefined,
  ExecutionContext
>((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as UserEntity | undefined;
  if (!user) {
    return undefined;
  }

  // If @CurrentUser('email') → return just that property
  return typeof data === 'string' ? (user as any)[data] : user;
});
