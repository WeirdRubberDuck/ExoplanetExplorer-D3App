import { Topic } from './topic';
import { JsonValue } from './types/generated';
import {
  AssetData,
  Factory,
  KeyboardData,
  LicenseEntry,
  LuaLibrary
} from './types/generated/documentationtopic';
import { OpenSpaceLibrary } from './types/generated/openspacelualibrary';
import {
  ISocket,
  NarrowedGetPropertyTopicData,
  NarrowedSubscriptionTopic,
  PropertyTypes,
  TopicData,
  TopicId,
  TopicPayload
} from './types/types';
export declare class OpenSpaceApi {
  private _callbacks;
  private _nextTopicId;
  private _socket;
  private _userOnConnect;
  /**
   * Construct an instance of the OpenSpace API.
   *
   * @param socket - An instance of Socket or WebSocket. The socket should not be
   * connected prior to calling this constructor.
   */
  constructor(socket: ISocket);
  private _sendHandshake;
  /**
   * Set connect callback.
   *
   * @param callback - The function to execute when connection is established.
   */
  onConnect(callback: () => void): void;
  /**
   * Set disconnect callback.
   *
   * @param callback - The function to execute when socket is disconnected.
   */
  onDisconnect(callback: () => void): void;
  /**
   * Connect to OpenSpace.
   */
  connect(): void;
  /**
   * Disconnect from OpenSpace.
   */
  disconnect(): void;
  /**
   * Initialize a new channel of communication
   *
   * @param type - A string specifying the type of topic to construct. See OpenSpace's
   * server module for available topic types.
   * @param payload - An object containing the data to send to OpenSpace when initializing
   * the topic.
   * @param cancelPayload - An optional object containing the data to send to OpenSpace
   * as a last message before cancelling and closing the topic.
   * @return An object representing the topic.
   */
  startTopic<T extends TopicId>(
    type: T,
    payload: TopicPayload<T>,
    cancelPayload?: TopicPayload<T>
  ): Topic<T>;
  /**
   * Authenticate this client. This must be done if the client is not whitelisted in
   * openspace.cfg.
   *
   * @param secret - The secret used to authenticate with OpenSpace.
   */
  authenticate(secret: string): Promise<TopicData<'authorize'>>;
  /**
   * Set the property value.
   *
   * @param property - The URI of the property to set.
   * @param value - The value to set the property to.
   */
  setProperty(property: string, value: JsonValue): void;
  /**
   * Get a property or property owner.
   *
   * @param property - The URI of the property to get.
   * @return The value of the property or property owner.
   */
  getProperty(property: string): Promise<TopicData<'get'>>;
  getProperty<T extends PropertyTypes>(
    property: string,
    expectedType: T
  ): Promise<NarrowedGetPropertyTopicData<T>>;
  /**
   * Get documentation from OpenSpace.
   *
   * @param type - The type of documentation to get.
   * @return An object representing the requested documentation.
   */
  getDocumentation(type: 'lua'): Promise<LuaLibrary[]>;
  getDocumentation(type: 'factories'): Promise<Factory[]>;
  getDocumentation(type: 'keyboard'): Promise<KeyboardData>;
  getDocumentation(type: 'asset'): Promise<AssetData>;
  getDocumentation(type: 'meta'): Promise<LicenseEntry[]>;
  getDocumentation(
    type: TopicPayload<'documentation'>['type']
  ): Promise<TopicData<'documentation'>>;
  /**
   * Subscribe to a property value. Anytime the property value changes, the subscribed
   * topic receives the updated value.
   *
   * @param property - The URI of the property.
   * @param expectedType - The expected property type to subscribe to. If the expected
   * type is different from the actual type an error is thrown.
   * @return A topic object to represent the subscription topic. When cancelled, this
   * object will unsubscribe to the property.
   */
  subscribeToProperty(property: string): Topic<'subscribe'>;
  subscribeToProperty<T extends PropertyTypes>(
    property: string,
    expectedType: T
  ): NarrowedSubscriptionTopic<T>;
  /**
   * Execute a Lua script.
   *
   * @param script - The Lua script to execute.
   * @param getReturnValue - Specified whether the return value should be collected.
   * @param shouldBeSynchronized - Specified whether the script should be synchronized on
   * a cluster.
   * @return The return value of the script, if `getReturnValue` is true, otherwise
   * undefined.
   */
  executeLuaScript(
    script: string,
    getReturnValue?: boolean,
    shouldBeSynchronized?: boolean
  ): Promise<TopicData<'luascript'> | void>;
  /**
   * Execute a Lua function from the OpenSpace library.
   *
   * @param fun - The Lua function to execute, for example `openspace.addSceneGraphNode`.
   * @param args - The function arguments.
   * @param getReturnValue - Specified whether the return value should be collected
   * @return The return value of the script, if `getReturnValue` is true, otherwise
   * nothing.
   */
  executeLuaFunction(
    fun: string,
    args: unknown[],
    getReturnValue: true
  ): Promise<TopicData<'luascript'>>;
  executeLuaFunction(fun: string, args: unknown[], getReturnValue: false): Promise<void>;
  executeLuaFunction(fun: string, args: unknown[]): Promise<TopicData<'luascript'>>;
  /**
   * Get an object representing the OpenSpace Lua library.
   *
   * @return The Lua library, mapped to async JavaScript functions.
   */
  library<T = OpenSpaceLibrary>(): Promise<T>;
}
