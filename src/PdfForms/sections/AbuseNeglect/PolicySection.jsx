import React from 'react';

const PolicySection = ({ formData, onInputChange }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Abuse and Neglect Policy</h3>
      
      {/* Policy Header */}
      <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-2">Policy:</h4>
        <p className="text-sm text-gray-700">
          It is the policy of Mastercare to ensure that service will be free of physical, psychological, sexual, financial abuse and neglect. Persons serviced by Mastercare, will be treated with respect and dignity. Any form of abuse or neglect is strictly prohibited.
        </p>
      </div>

      {/* Definitions Section */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Definitions:</h4>
        
        <div className="space-y-4">
          <div className="p-3 border border-gray-200 rounded">
            <h5 className="font-medium text-gray-700 mb-1">Physical Abuse:</h5>
            <p className="text-sm text-gray-600">
              Non-accidental injury, pain, or impairment such as from hitting, slapping, improper restraint, or poisoning.
            </p>
          </div>
          
          <div className="p-3 border border-gray-200 rounded">
            <h5 className="font-medium text-gray-700 mb-1">Psychological or Emotional Abuse:</h5>
            <p className="text-sm text-gray-600">
              Threats, insults, harassment, humiliation, intimidation, or other means that profoundly confuse or frighten the vulnerable
            </p>
          </div>
          
          <div className="p-3 border border-gray-200 rounded">
            <h5 className="font-medium text-gray-700 mb-1">Sexual Abuse:</h5>
            <p className="text-sm text-gray-600">
              Sexual contact or conduct including pornographic photographing without consent.
            </p>
          </div>
          
          <div className="p-3 border border-gray-200 rounded">
            <h5 className="font-medium text-gray-700 mb-1">Financial Exploitation:</h5>
            <p className="text-sm text-gray-600">
              Wrongful taking, withholding, appropriation, or use of the client's money, real property, or personal property.
            </p>
          </div>
          
          <div className="p-3 border border-gray-200 rounded">
            <h5 className="font-medium text-gray-700 mb-1">Caregiver Neglect:</h5>
            <p className="text-sm text-gray-600">
              Failure to provide adequate food, shelter, clothing, timely health care, personal hygiene, supervision, protection from abandonment, or failure to carry out responsibilities that a reasonable person would exercise as an assumed, legal, or contractual caregiver
            </p>
          </div>
          
          <div className="p-3 border border-gray-200 rounded">
            <h5 className="font-medium text-gray-700 mb-1">Self-Neglect:</h5>
            <p className="text-sm text-gray-600">
              Failure to care for oneself, thereby exposing oneself to a situation or condition that poses an immediate risk of death or serious physical harm.
            </p>
          </div>
        </div>
      </div>

      {/* Expectations Section */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Expectations:</h4>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 text-xs">1</span>
            </div>
            <p className="text-sm text-gray-700">
              All staff/consultants share the responsibility of assuring that all persons receiving services are free from abuse or neglect.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 text-xs">2</span>
            </div>
            <p className="text-sm text-gray-700">
              All clients will be treated with respect and should not be demeaned, belittled or degraded.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 text-xs">3</span>
            </div>
            <p className="text-sm text-gray-700">
              Mastercare will not hire individuals with a conviction or prior employment history of child, elderly or any abuse, neglect or mistreatment. Reference of past employment will be checked as per report; investigation procedures are to be followed.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 text-xs">4</span>
            </div>
            <p className="text-sm text-gray-700">
              Immediately upon observation or discovery of abuse or neglect, a report to the Operations Manager or immediate supervisor must be made. Failure to report will result in disciplinary action up to and including termination.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 text-xs">5</span>
            </div>
            <p className="text-sm text-gray-700">
              Staff will ensure that medical attention is provided immediately as needed for treatment of possible trauma.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 text-xs">6</span>
            </div>
            <p className="text-sm text-gray-700">
              Guardian/advocates, care coordinators, case managers, and appropriate state agencies must be notified as per federal, state, and local rules and regulations.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 text-xs">7</span>
            </div>
            <p className="text-sm text-gray-700">
              A preliminary decision regarding the allegation shall be made within five (5) calendar days of the allegations unless doing so would violate protective services procedures. A final written report must be completed within 7 days from the incidents.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 text-xs">8</span>
            </div>
            <p className="text-sm text-gray-700">
              All staff will receive instruction/training and orientation in preventing and reporting abuse, mistreatment or neglect of persons on at least an annual basis as well as instructions in the appropriate approaches to managing persons with Alzheimer's and Parkinson's disease and I/DD.
            </p>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-600 text-xs">9</span>
            </div>
            <p className="text-sm text-gray-700">
              Any person who is subjected to retaliatory action upon making a report of individual abuse, neglect or exploitation, or whose report is ignored without cause, shall immediately contact the Operations Manager or call the Service Supervisor. Any employee found guilty of retaliatory action may subject to disciplinary action.
            </p>
          </div>
        </div>
      </div>

      {/* Employee Name Input */}
      <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Acknowledgment:</h4>
        <p className="text-sm text-gray-700 mb-3">
          I, <span className="font-medium text-blue-600">{formData["I"] || "[Your Name]"}</span> have read and understand the above policy on abuse and neglect and I agree to abide by these policies.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Full Name
          </label>
          <input
            type="text"
            value={formData["I"]}
            onChange={(e) => onInputChange("I", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PolicySection;