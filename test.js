/* const e = new Expr(Expr.types.NOT, [
    new Expr(Expr.types.NOT, [
        new Expr(Expr.types.CONST, [false]),
    ]),
]);
console.log(e.toString());

e.simplifyShallow();
console.log(e.toString()); */

// const f = new Expr(Expr.types.NOT, [
//     new Expr(Expr.types.NOT, [
//         new Expr(Expr.types.NOT, [
//             new Expr(Expr.types.NOT, [
//                 new Expr(Expr.types.NOT, [
//                     new Expr(Expr.types.CONST, [true]),
//                 ]),
//             ]),
//         ]),
//     ]),
// ]);
// console.log(f.toString());

// f.simplifyShallow();
// console.log(f.toString());

const f = new Expr(Expr.types.NOT, [
    new Expr(Expr.types.NOT, [
        new Expr(Expr.types.NOT, [
            new Expr(Expr.types.NOT, [
                new Expr(Expr.types.NOT, [
                    new Expr(Expr.types.CONST, [true]),
                ]),
            ]),
        ]),
    ]),
]);
console.log(f.toString());

f.simplifyShallow();
console.log(f.toString());