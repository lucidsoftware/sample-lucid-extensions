import {Directive} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';

@Directive({
    selector: '[noWhitespace]',
    providers: [{provide: NG_VALIDATORS, useExisting: NoWhitespaceValidator, multi: true}],
    standalone: true,
})
export class NoWhitespaceValidator implements Validator {
    validate(control: AbstractControl): {[key: string]: any} | null {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : {'whitespace': true};
    }
}
