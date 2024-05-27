import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { faker } from '@faker-js/faker';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import {
  Car,
  Lot,
  LotNode,
  MAX_MILEAGE,
  Statuses,
  convertLotToLotNode,
  Colors,
} from '../../../common/constants';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TreeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Rental Car Manager UI';

  constructor(private readonly cdr: ChangeDetectorRef) {
    window.addEventListener('message', (e) => {
      this.initialize(e.data);
    });

    parent.postMessage({ init: 'init' }, '*');
  }

  /**
   * Contains a tree with the following heirarchy:
   *   Lots
   *   -- Cars
   */
  private lotNodes: LotNode[] = [];

  /**
   *  Represents the LotNode[] in a way that PrimeNG can use.
   */
  tree: TreeNode[] = [];

  addLotsToModal(lots: Lot[]) {
    const newLotNodes = lots.map(convertLotToLotNode);
    for (const newLotNode of newLotNodes) {
      this.lotNodes = this.lotNodes.concat(newLotNode);

      const newLotTreeNode = this.convertLotNodeToTreeNode(newLotNode);
      this.tree.push(newLotTreeNode);
    }
    this.cdr.detectChanges();
  }

  addCarsToModal(cars: Car[]) {
    for (const car of cars) {
      const lotNode = this.lotNodes.find(
        (lotNode) => lotNode.lot.address === car.lot,
      );
      const lotTreeNode = this.tree.find(
        (lotTreeNode) => lotTreeNode.label === car.lot,
      );
      if (!lotNode || !lotTreeNode) {
        continue;
      }

      if (lotNode.cars) {
        lotNode.cars.push(car);
      } else {
        lotNode.cars = [car];
      }

      const newCarTreeNode = this.convertCarToTreeNode(car);
      lotTreeNode.children?.push(newCarTreeNode);
    }
    this.cdr.detectChanges();
  }

  generateN<Type>(
    numberToGenerate: number,
    generateFunction: (args?: any) => Type,
  ) {
    const result = [];
    for (let i = 0; i < numberToGenerate; i++) {
      result.push(generateFunction());
    }
    return result;
  }

  generateCars(numberToGenerate: number, lotAddress: string) {
    const cars = this.generateN(numberToGenerate, () =>
      this.generateCar(lotAddress),
    );
    this.addCarsToModal(cars);
    parent.postMessage({ cars }, '*');
  }

  generateLots(numberToGenerate: number) {
    const lots = this.generateN(numberToGenerate, this.generateLot);
    this.addLotsToModal(lots);
    parent.postMessage({ lots }, '*');
  }

  visualize() {
    parent.postMessage({ visualize: this.lotNodes }, '*');
  }

  private initialize(initData: any) {
    if (initData['lots']) {
      const lots: Lot[] = initData['lots'].map((json: unknown) => {
        return json as Lot;
      });
      this.addLotsToModal(lots);
    }

    if (initData['cars']) {
      const cars: Car[] = initData['cars'].map((json: unknown) => {
        return json as Car;
      });
      this.addCarsToModal(cars);
    }
  }

  private generateCar(lotAddress: string): Car {
    const color = faker.helpers.enumValue(Colors);
    const status = faker.helpers.enumValue(Statuses);
    const nextServiceDate =
      Math.random() > 0.7
        ? faker.date.past({ years: 1 })
        : faker.date.future({ years: 1 });
    return {
      id: faker.string.uuid(),
      type: faker.vehicle.type(),
      make: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      color: color,
      miles: Math.floor(Math.random() * MAX_MILEAGE),
      status: status,
      lot: lotAddress,
      manufacturedDate: this.serializeDate(faker.date.past({ years: 12 })),
      lastServiceDate: this.serializeDate(faker.date.past({ years: 2 })),
      nextServiceDate: this.serializeDate(nextServiceDate),
    };
  }

  private generateLot(): Lot {
    return {
      address: faker.location.streetAddress(false),
      image: faker.image.urlLoremFlickr({ category: 'street' }),
    };
  }

  private convertCarToTreeNode(car: Car): TreeNode {
    return {
      type: 'car',
      label: `${car.make} ${car.model}`,
      data: car,
    };
  }

  private convertLotNodeToTreeNode(lotNode: LotNode): TreeNode {
    const lot = lotNode.lot;
    return {
      type: 'lot',
      label: lot.address,
      data: lot,
      children: lotNode.cars.map(this.convertCarToTreeNode.bind(this)),
    };
  }

  private serializeDate(date: Date) {
    return { isoDate: date.toISOString() };
  }
}
