import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    tableName: 'balance',
    timestamps: false
})
export class BalanceModel extends Model {
    @PrimaryKey
    @Column({ allowNull: false })
    account_id: string

    @Column({ allowNull: false })
    balance: number

}