import { gql } from 'apollo-server';

/**
 * Scheme for the GraphQL Api endpoint. Defines how a request query may look like. 
 */
export default gql`
"""
A single room in the general Cube 
"""
type Cube {
  uid: ID
  label: String
  color: String
  x: Int
  y: Int
  z: Int
  items: [Item]
  neighbours: [Cube]
}

"""
The content of an Item
"""
type ItemContent {
  contentId: ID
  label: String
  contentType: String
  text: String
  src: String
}

"""
Items in a room
"""
type Item {
  itemUid: ID
  type: String
  label: String
  content: [ItemContent]
  refs: [Item]
}

type Query {
  cubes(id: ID): [Cube]
  pathTo(startId: ID, targetId: ID): [Cube]
  connectedOverItem(itemId: ID): [Cube]
}
`;


