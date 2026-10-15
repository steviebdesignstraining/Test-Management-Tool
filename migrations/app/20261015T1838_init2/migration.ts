#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2c53f8e505613541dda0de4ebeaf62bc480cecfea6e37dc5f34ceb44bb7f0d65/contract';
import startContract from '../../snapshots/2c53f8e505613541dda0de4ebeaf62bc480cecfea6e37dc5f34ceb44bb7f0d65/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9ed2b4cf4bbfa6b33932411df5e76c22edfe945e1f7a18fd2ade03aeab0eda81/contract';
import endContract from '../../snapshots/9ed2b4cf4bbfa6b33932411df5e76c22edfe945e1f7a18fd2ade03aeab0eda81/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'Post' }),
      this.dropColumn({ schema: 'public', table: 'User', column: 'username' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
