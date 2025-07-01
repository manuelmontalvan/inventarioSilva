import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'minMaxStock', async: false })
export class MinMaxStockValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const dto = args.object as any;

    if (dto.min_stock !== undefined && dto.max_stock !== undefined) {
      return dto.min_stock <= dto.max_stock;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'min_stock debe ser menor o igual a max_stock';
  }
}
