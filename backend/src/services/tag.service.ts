import prisma from '../config/db';

/**
 * Service class for handling operations related to Tags.
 */
export class TagService {
  /**
   * Retrieves all tags from the database sorted alphabetically by name.
   * Includes a count of posts associated with each tag.
   * @returns {Promise<Array>} A promise that resolves to an array of tag objects.
   */
  static async getAllTags() {
    return await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Creates a new tag in the database with the given name and slug.
   * @param {string} name - The human-readable name of the tag.
   * @param {string} slug - The URL-safe slug for the tag.
   * @returns {Promise<Object>} A promise that resolves to the created tag object.
   */
  static async createTag(name: string, slug: string) {
    return await prisma.tag.create({
      data: { name, slug }
    });
  }

  /**
   * Deletes a tag from the database by its ID.
   * @param {string} id - The unique identifier of the tag to delete.
   * @returns {Promise<Object>} A promise that resolves to the deleted tag object.
   */
  static async deleteTag(id: string) {
    return await prisma.tag.delete({
      where: { id }
    });
  }
}
