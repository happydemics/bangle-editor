import { NodeType, Command, EditorState, Node } from '@bangle.dev/pm';

type MoveDirection = 'UP' | 'DOWN';
declare function copyEmptyCommand(type: NodeType): Command;
declare function cutEmptyCommand(type: NodeType): Command;
declare function parentHasDirectParentOfType(parentType: NodeType, parentsParentType: NodeType | NodeType[]): (state: EditorState) => boolean;
/**
 * Moves a node up and down. Please do a sanity check if the node is allowed to move or not
 * before calling this command.
 *
 * @param {PMNodeType} type The items type
 * @param {['UP', 'DOWN']} dir
 */
declare function moveNode(type: NodeType, dir?: MoveDirection): Command;
declare const setSelectionAtEnd: (node: Node) => Command;
declare function jumpToStartOfNode(type: NodeType): Command;
declare function jumpToEndOfNode(type: NodeType): Command;

export { MoveDirection, copyEmptyCommand, cutEmptyCommand, jumpToEndOfNode, jumpToStartOfNode, moveNode, parentHasDirectParentOfType, setSelectionAtEnd };
