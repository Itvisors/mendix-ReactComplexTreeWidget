// This file was generated by Mendix Studio Pro.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the import list
// - the code between BEGIN USER CODE and END USER CODE
// - the code between BEGIN EXTRA CODE and END EXTRA CODE
// Other code you write will be lost the next time you deploy the project.
// Special characters, e.g., é, ö, à, etc. are supported in comments.

package communitycommons.actions;

import com.mendix.systemwideinterfaces.core.IMendixObject;
import communitycommons.ORM;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.webui.CustomJavaAction;

/**
 * Returns true if at least one member (including owned associations) of this object has changed.
 * 
 * For Mendix < 9.5 this action keeps track of changes to the object except when 'changing to the same value'. For Mendix >= 9.5 this action keeps track of all changes. This is a result of a change of the underlying Mendix runtime-server behaviour. 
 */
public class objectHasChanged extends CustomJavaAction<java.lang.Boolean>
{
	private IMendixObject item;

	public objectHasChanged(IContext context, IMendixObject item)
	{
		super(context);
		this.item = item;
	}

	@java.lang.Override
	public java.lang.Boolean executeAction() throws Exception
	{
		// BEGIN USER CODE
		return ORM.objectHasChanged(item);
		// END USER CODE
	}

	/**
	 * Returns a string representation of this action
	 * @return a string representation of this action
	 */
	@java.lang.Override
	public java.lang.String toString()
	{
		return "objectHasChanged";
	}

	// BEGIN EXTRA CODE
	// END EXTRA CODE
}
