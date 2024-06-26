# frozen_string_literal: true
class CreateDiscourseEventsConnections < ActiveRecord::Migration[7.0]
  def change
    create_table :discourse_events_connections do |t|
      t.references :user
      t.references :source,
                   index: true,
                   null: false,
                   foreign_key: {
                     to_table: :discourse_events_sources,
                   }
      t.references :category
      t.string :client

      t.timestamps
    end

    add_index :discourse_events_connections,
              %i[source_id category_id],
              unique: true,
              name: "events_source_category_connection_index",
              if_not_exists: true
  end
end
