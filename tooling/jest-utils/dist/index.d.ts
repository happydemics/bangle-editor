declare const jestExpect: {
    toEqualDocAndSelection: typeof toEqualDocAndSelection;
    toEqualDocument(actual: any, expected: any): any;
};
declare function toEqualDocAndSelection(actual: any, expected: any): {
    pass: any;
    actual: any;
    expected: any;
    message: () => string;
    name: string;
};

export { jestExpect };
