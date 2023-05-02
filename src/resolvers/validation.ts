import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

@ValidatorConstraint()
export class StringUnion implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return args.constraints.includes(text);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Text '$value' is not part of the string union: '${validationArguments.constraints.join(
      " | "
    )}'`;
  }
}

@ValidatorConstraint()
export class CannotUseWithout implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    for (let constraint of args.constraints) {
      if (!args.object[constraint]) return false
    }
    
    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Property ${validationArguments.property} must be used with [${validationArguments.constraints.join(",")}]`
  }
}

@ValidatorConstraint()
export class CannotUseWith implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    for (let constraint of args.constraints) {
      if (args.object[constraint]) return false;
    }

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Property ${validationArguments.property} cannot be used with [${validationArguments.constraints.join(",")}]`
  }
}

